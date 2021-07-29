var product = product || {};

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
                            <a href='javascript:;' class='btn btn-success btn-sm'>
                                <i class='fa fa-pencil-alt'></i>
                            </a>
                            <a href='javascript:;' class='btn ${item.status ? "btn-warning" : "btn-secondary"} btn-sm' 
                                onclick='product.confirmChangeStatus(${item.id}, ${item.status})'><i class='fa ${item.status ? "fa-trash" : "fa-trash-restore"}'></i></a>
                        </td>
                    </tr>
                    `);
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
                    $.notify("Product has been create success", "success");
                }
                else{
                    $.notify(`Something went wrong, please try again.`, "eror");
                }
            }
        })
    }
}

product.reset = function(){
    $('#productForm').validate().resetForm();
}

product.confirmChangeStatus = function(productId, status){
    bootbox.confirm({
        title: "Change product status?",
        message: `Do you want to ${status ? "inactive" : "active"} the product now?.`,
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

product.changeStatus = function(producId, status){
    let updateObj = {};
    updateObj.status = !status;
    $.ajax({
        url:`https://6100c20bbca46600171cf995.mockapi.io/product/${producId}`,
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

product.init = function(){
    product.productList();
}


$(document).ready(function(){
    product.init();
});

