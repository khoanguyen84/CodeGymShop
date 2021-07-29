var product = product || {};

var products = [];

product.gets = function(){
    $.ajax({
        url:'https://6100c20bbca46600171cf995.mockapi.io/product',
        method:'GET',
        success: function(reponse){
            products = reponse;
        }
    });
}

product.productList = function(){
    $.ajax({
        url:'https://6100c20bbca46600171cf995.mockapi.io/product',
        method:'GET',
        success: function(reponse){
            $('.table-product tbody').empty();
            reponse = reponse.sort(function(pdt1, pdt2){
                return pdt2.id - pdt1.id;
            })
            $.each(reponse, function(index, item){
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
                                title="Edit product"
                                onclick="product.getProduct(${item.id})">
                                <i class='fa fa-pencil-alt'></i>
                            </a>
                            <a href='javascript:;' class='btn ${item.status ? "btn-warning" : "btn-secondary"} btn-sm'
                                title="${item.status ? "Inactive product" : "Active product"}"
                                onclick='product.confirmChangeStatus(${item.id}, ${item.status})'><i class='fa ${item.status ? "fa-unlock-alt" : "fa-lock"}'></i></a>
                            <a href='javascript:;' onclick='product.remove(${item.id})' class='btn btn-danger btn-sm'><i class='fa fa-trash'></i></a>
                        </td>
                    </tr>
                    `);
            });
            $('.table-product').DataTable({
                "columnDefs": [
                    { "searchable": false, "targets": [0,6,7] },
                    { "orderable": false, "targets": [6,7] }
                  ],
                "order": [[0, 'desc']]
            });
        }
    });
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
                        $.notify(`Something went wrong, please try again.`, "eror");
                    }
                }
            });
        }else{
            let updateObj = {};
            updateObj.productname = $('input[name="productname"]').val();
            updateObj.price = $('input[name="price"]').val();
            updateObj.quantity = $('input[name="quantity"]').val();
            updateObj.manufactory = $('input[name="manufactory"]').val();
            updateObj.status = $('input[name="active"]').is(":checked");
            updateObj.id = productId;
    
            $.ajax({
                url:`https://6100c20bbca46600171cf995.mockapi.io/product/${productId}`,
                method: "PUT",
                contentType:"application/json",
                datatype :"json",
                data: JSON.stringify(updateObj),
                success: function(result){
                    if(result){
                        product.productList();
                        $('#productModal').modal('hide');
                        $.notify("Product has been updated success", "success");
                    }
                    else{
                        $.notify(`Something went wrong, please try again.`, "eror");
                    }
                }
            });
        }
    }
}

product.reset = function(){
    $('#productForm').validate().resetForm();
    $('#productModal').find('.modal-title').text('Add product');
    $('input[name="productname"]').val("");
    $('input[name="price"]').val("");
    $('input[name="quantity"]').val("");
    $('input[name="manufactory"]').val("");
    $('input[name="active"]').prop("checked",false);
    $('input[name="productId"]').val(0);
}

product.confirmChangeStatus = function(productId, status){
    bootbox.confirm({
        title: "Change product status?",
        message: `Do you want to ${status ? "inactive" : "active"} the product now?`,
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
    let updateObj = {};
    updateObj.status = !status;
    $.ajax({
        url:`https://6100c20bbca46600171cf995.mockapi.io/product/${productId}`,
        method: "PUT",
        contentType:"application/json",
        datatype :"json",
        data: JSON.stringify(updateObj),
        success: function(result){
            if(result){
                product.productList();
                $.notify(`Product has been ${status ? 'inactive' : 'active'} success`, "success");
            }
            else{
                $.notify(`Something went wrong, please try again.`, "eror");
            }
        }
    })
}

product.getProduct = function(productId){
    $.ajax({
        url:`https://6100c20bbca46600171cf995.mockapi.io/product/${productId}`,
        method: "GET",
        success: function(response){
            $('input[name="productname"]').val(response.productname);
            $('input[name="price"]').val(response.price);
            $('input[name="quantity"]').val(response.quantity);
            $('input[name="manufactory"]').val(response.manufactory);
            $('input[name="active"]').prop("checked", response.status);
            $('input[name="productId"]').val(response.id);

            $('#productModal').find('.modal-title').text('Edit product');
            $('#productModal').modal('show');
        }
    });
}

product.remove = function(productId){
    bootbox.confirm({
        title: "Remove product?",
        message: `Do you want to remove the product now?`,
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
                    method: "DELETE",
                    success: function(result){
                        if(result){
                            product.productList();
                            $.notify(`Product has been removed success`, "success");
                        }
                        else{
                            $.notify(`Something went wrong, please try again.`, "eror");
                        }
                    }
                })
            }
        }
    });
}

product.init = function(){
    product.productList();
    product.gets();
}

$(document).ready(function(){
    product.init();
});

