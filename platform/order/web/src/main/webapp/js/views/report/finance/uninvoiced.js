/**
 * Created by Rabbit Mao on 2015/7/20.
 */

var dt;
function fillDataTable() {
    dt = $('#forShow').DataTable({
        lengthChange: true, //显示pageSize的下拉框
        pageLength: 10,
        serverSide: true, //服务模式
        searching: false, //是否启用搜索
        ordering: false, //是否启用排序
        oLanguage: {sUrl: Context.PATH + "/js/DT_zh.txt"}, //自定义语言包
        ajax: {
            url: Context.PATH + '/report/finance/unInvoiced/list.html',
            type: "POST",
            data: function (d) {
                return $.extend({}, d, {
                    organization: $("#sorganizationHidden").val(),
                    buyerName: $("#sbuyerName").val(),
                    timeFrom: $("#stimefrom").val(),
                    timeTo: $("#stimeto").val()
                });
            }
        },
        columns: [
            {defaultContent: ""},
            {defaultContent: ''},
            {data: 'nsortName'},
            {data: 'spec'},
            {data: 'material'},
            {data: 'weight'},
            {data: 'price'},
            {data: 'noTaxAmount'},
            {data: 'taxAmount'},
            {data: 'totalAmount'},
            {data: 'orderCode'},
            {data: 'orgName'}
        ],
        fnRowCallback: function (nRow, aData, iDataIndex) {
            var inputHtml = "<input type='checkbox' name='check' value='" + aData.itemId + "'>";
            $('td:eq(0)', nRow).html(inputHtml);
            var custName = aData.buyerName;
        	if (aData.departmentCount > 1) {
        		custName = custName+"【"+aData.departmentName+"】";
        	}
        	$('td:eq(1)', nRow).html(custName);
            $('td:eq(5)', nRow).html(renderWeight(aData.weight)).addClass("text-right");
            $('td:eq(6)', nRow).html(formatMoney(aData.price, 2)).addClass("text-right");
            $('td:eq(7)', nRow).html(formatMoney(aData.noTaxAmount, 2)).addClass("text-right");
            $('td:eq(8)', nRow).html(formatMoney(aData.taxAmount, 2)).addClass("text-right");
            $('td:eq(9)', nRow).html(formatMoney(aData.totalAmount, 2)).addClass("text-right");
        }
    });
}

var selectIds = [];

// 下载excel文件
function downloadExcelForm(isOutputAll) {
    var form = $("<form>");
    form.attr('style', 'display:none');
    form.attr('target', '');
    form.attr('method', 'post');
    form.attr('action', Context.PATH + "/report/finance/unInvoiced/output.html");
    $('body').append(form);

    if(!isOutputAll) {
        if(selectIds.length == 0){
            cbms.alert("请选择要导出的记录后重试！");
            return false;
        }
        var input1 = $('<input>');
        input1.attr('type', 'hidden');
        input1.attr('name', 'selectIds');
        input1.attr('value', JSON.stringify(selectIds));
        form.append(input1);
    }
    var input2 = $('<input>');
    input2.attr('type', 'hidden');
    input2.attr('name', 'timeFrom');
    input2.attr('value', $("#stimefrom").val());
    var input3 = $('<input>');
    input3.attr('type', 'hidden');
    input3.attr('name', 'timeTo');
    input3.attr('value', $("#stimeto").val());
    var input4 = $('<input>');
    input4.attr('type', 'hidden');
    input4.attr('name', 'organization');
    input4.attr('value', $("#sorganizationHidden").val());
    var input5 = $('<input>');
    input5.attr('type', 'hidden');
    input5.attr('name', 'buyerName');
    input5.attr('value', $("#sbuyerName").val());

    form.append(input2);
    form.append(input3);
    form.append(input4);
    form.append(input5);

    form.submit();
    form.remove();
}

jQuery(function ($) {
    fillDataTable();

    $("#searchForm").on("click", "#search", function () {
        selectIds = [];
        dt.ajax.reload();
    });

    $(document).on("click", "#output", function () {
        downloadExcelForm(false);
    });

    $(document).on("click", "#outputAll", function () {
        downloadExcelForm(true);
    });
});

// 统计选中的发票
function invoiceTotal() {
    selectIds = [];
    var checked = $("input[name='check']:checked");
    $(checked).each(function () {
        var id = $(this).val();
        selectIds.push(id);
    });

    var checkedCount = checked.length;
    $('#checkCount').text(checkedCount);
}

// 全选/全不选
$("#allCheck").click(function () {
    var checked = $(this).is(':checked');
    // 取消全选
    if (!checked) {
        $("input[name='check']").removeAttr("checked");
        $(this).removeAttr("checked");
    }
    else {
        $("input[name='check']").prop('checked', true);
        $(this).prop('checked', true);
    }

    invoiceTotal();
});

// 单选
$("body").on("click", "input[name='check']", function () {
    var checked = $(this).is(':checked');
    if (!checked) {
        $(this).removeAttr("checked");
        $("#allCheck").removeAttr("checked");   // 取消全选
    }
    else {
        $(this).prop('checked', true);
    }

    // 如果全部选中，那么全选checkbox选中
    var checkCount = $("input[name='check']").length;
    var checkedCount = $("input[name='check']:checked").length;
    if (checkCount == checkedCount) {
        $("#allCheck").prop('checked', true);
    }

    invoiceTotal();
});
