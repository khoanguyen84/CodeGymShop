var product = product || {};

product.productList = function(){
    $.ajax({
        url:'https://6100c20bbca46600171cf995.mockapi.io/product',
        method:'GET',
        success: function(response){
            $('.table-product tbody').empty();
            response = response.sort(function(pdt1, pdt2){
                return pdt2.id - pdt1.id;
            })
            $.each(response, function(index, item){
                $('.table-product tbody').append(`
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.productname}</td>
                        <td class='text-right'>${item.price}</td>
                        <td class='text-right'>${item.quantity}</td>
                        <td class='text-right'>
                            ${(item.price * item.quantity).toLocaleString('vi', {style : 'currency', currency : 'VND'})}
                        </td>
                        <td>${item.manufactory}</td>
                        <td class='text-right'>
                            ${item.status ? 
                                    '<span class="badge bg-primary">Active</span>' : 
                                    '<span class="badge bg-danger">Inactive</span>'}
                        </td>
                        <td>
                            <a href='javascript:;' class='btn btn-success btn-sm'
                                title='Modify product'
                                onclick="product.getProduct(${item.id})">
                                <i class='fa fa-pencil-alt'></i>
                            </a>
                            <a href='javascript:;' onclick="product.confirmChangeStatus(${item.id}, ${item.status})" 
                                class='btn ${item.status ? "btn-warning" : "btn-secondary"} btn-sm'
                                    title='${item.status ? "Inactive product" : "Active product"}'>
                                    <i class='fa ${item.status ? "fa-lock-open" : "fa-lock"}'></i></a>
                            <a href='javascript:;' class='btn btn-danger btn-sm' title='Remove product'
                                onclick="product.removeProduct(${item.id})">
                                <i class='fa fa-trash'></i>
                            </a>
                        </td>
                    </tr>
                    `);
            });
            $('.table-product').DataTable({
                columnDefs: [
                    { orderable: false, targets: [6,7] },
                    { searchable: false, targets: [0,6,7] }
                  ],
                order: [[0, 'desc']]
            });
        }
    })
}

product.showModal = function(){
    product.reset();
    $('#productModal').modal('show');
}

product.save = function(){
    if($('#productForm').valid()){
        let productId = parseInt($('input[name="productId"]').val());
        if(productId == 0){
            let createObj = {};
            createObj.productname = $('input[name="productname"]').val();
            createObj.price = $('input[name="price"]').val();
            createObj.quantity = $('input[name="quantity"]').val();
            createObj.manufactory = $('input[name="manufactory"]').val();
            createObj.status = $('input[name="active"]').is(":checked");
    
            $.ajax({
                url:'https://6100c20bbca46600171cf995.mockapi.io/product',
                method: "POST",
                contentType:"application/json",
                datatype :"json",
                data: JSON.stringify(createObj),
                success: function(result){
                    if(result){
                        product.productList();
                        $('#productModal').modal('hide');
                        $.notify("Product has been created success", "success");
                    }
                    else{
                        $.notify("Something went wrong, please try again", "error");
                    }
                }
            })
        }
        else{
            let modifyObj = {};
            modifyObj.productname = $('input[name="productname"]').val();
            modifyObj.price = $('input[name="price"]').val();
            modifyObj.quantity = $('input[name="quantity"]').val();
            modifyObj.manufactory = $('input[name="manufactory"]').val();
            modifyObj.status = $('input[name="active"]').is(":checked");
            modifyObj.id = productId;
    
            $.ajax({
                url:`https://6100c20bbca46600171cf995.mockapi.io/product/${productId}`,
                method: "PUT",
                contentType:"application/json",
                datatype :"json",
                data: JSON.stringify(modifyObj),
                success: function(result){
                    if(result){
                        product.productList();
                        $('#productModal').modal('hide');
                        $.notify("Product has been updated success", "success");
                    }
                    else{
                        $.notify("Something went wrong, please try again", "error");
                    }
                }
            })
        }
        
    }
}


product.getProduct = function(productId){
    $.ajax({
        url:`https://6100c20bbca46600171cf995.mockapi.io/product/${productId}`,
        method:'GET',
        success: function(response){
            $('input[name="productname"]').val(response.productname);
            $('input[name="price"]').val(response.price);
            $('input[name="quantity"]').val(response.quantity);
            $('input[name="manufactory"]').val(response.manufactory);
            $('input[name="productId"]').val(response.id);
            $('input[name="active"]').prop("checked", response.status);

            $('#productModal').find('.modal-title').text('Modify product');
            $('#productModal').modal('show');
        }
    })
}

product.confirmChangeStatus = function(productId, status){
    bootbox.confirm({
        title: "Change product status?",
        message: `Do you want to ${status ? 'inactive' : 'active'} the product now?`,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if(result){
                product.changeStatus(productId, status);
            }
        }
    });
}

product.changeStatus = function(productId, status){
        let updateStatusObj = {};
        updateStatusObj.status = !status;

        $.ajax({
            url:`https://6100c20bbca46600171cf995.mockapi.io/product/${productId}`,
            method: "PUT",
            contentType:"application/json",
            datatype :"json",
            data: JSON.stringify(updateStatusObj),
            success: function(result){
                if(result){
                    product.productList();
                    $.notify("Product status has been changed success", "success");
                }
                else{
                    $.notify("Something went wrong, please try again", "error");
                }
            }
        })
}

product.removeProduct = function(productId){
    bootbox.confirm({
        title: "Remove product?",
        message: `Do you want to remove the product now? this cannot be undone.`,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if(result){
                $.ajax({
                    url:`https://6100c20bbca46600171cf995.mockapi.io/product/${productId}`,
                    method:'DELETE',
                    success: function(response){
                        if(response){
                            product.productList();
                            $.notify("Product has been removed success", "success");
                        }
                        else{
                            $.notify("Something went wrong, please try again", "error");
                        }
                    }
                })
            }
        }
    });
}

product.reset = function(){
    $('#productForm').validate().resetForm();
    $('#productForm')[0].reset();
    $('#productModal').find('.modal-title').text('Add product');
}

product.init = function(){
    product.productList();
}

$(document).ready(function(){
    product.init();
});
