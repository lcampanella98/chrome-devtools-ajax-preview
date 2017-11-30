var allRequests = [];
var filteredRequests = [];

var filters = {
    onlyHtml: true,
    onlyAjax: false
};

$(function () {


    chrome.devtools.network.onRequestFinished.addListener(
        function(request) {
            if (filters.onlyHtml && !(request.response.content.mimeType === 'text/html') ) return;
            allRequests.push(request);
            appendRequest(allRequests.length - 1);
        }
    );

    $('.net-table').on('click', "tr", null, function () {
        var idx = parseInt($(this).data('idx'));
        var req = allRequests[idx];
        var panel = $('#display-panel');
        //panel.append("hello");
        req.getContent(function (content, encoding) {
            panel.empty();
            panel.append(content);
            $('.display-style').remove();
            $.each($(panel).find('style'), function () {
                $('head').append('<style class="display-style">' + this.innerHTML + '</style>');
                this.remove();
            });
        });
    });

});



function appendRequest(idx) {
    var table = $('.net-table');
    var req = allRequests[idx];
    table.append('<tr data-idx="' + idx + '"><td>'+req.request.url+'</td><td>'+req.response.content.mimeType+'</td><td>'+req.response.status+'</td></tr>')
}