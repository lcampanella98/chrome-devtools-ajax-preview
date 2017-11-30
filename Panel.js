var allRequests = [];
var filteredRequests = [];

var filters = {
    onlyHtml: false,
    onlyAjax: true,
    fullURLs: false
};

$(function () {


    chrome.devtools.network.onRequestFinished.addListener(
        function(request) {
            allRequests.push(request);
            if (matchesFilters(request)) {
                filteredRequests.push(request);
                appendRequest(filteredRequests.length - 1);
            }
        }
    );

    $('.net-table').on('click', "tr", null, function () {
        var idx = parseInt($(this).data('idx'));
        var req = filteredRequests[idx];
        var panel = $('#display-panel');
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

    $('#chk-ajax').change(function() {
        filters.onlyAjax = this.checked;
        filterChanged();
    });

    $('#chk-html').change(function() {
        filters.onlyHtml = this.checked;
        filterChanged();
    });

    $('#chk-full-url').change(function() {
        filters.fullURLs = this.checked;
        filterChanged();
    });
});

function filterChanged() {
    var tbod = $('.net-table tbody');
    tbod.find('tr').remove();
    filteredRequests = [];
    for (var i = 0; i < allRequests.length; i++) {
        if (matchesFilters(allRequests[i])) filteredRequests.push(allRequests[i]);
    }
    for (var i = 0; i < filteredRequests.length; i++) {
        appendRequest(i);
    }
}

function matchesFilters(req) {
    if (filters.onlyHtml) {
        if (!(req.response.content.mimeType === 'text/html')) return false;
    }
    if (filters.onlyAjax) {
        if (!isAjax(req)) return false;
    }
    return true;
}

function isAjax(req) {
    var headers = req.request.headers;
    for (var i = 0; i < headers.length; i++) {
        if (headers[i]["name"].toLowerCase() === 'x-requested-with') {
            return headers[i]["value"].toLowerCase() === "xmlhttprequest";
        }
    }
    return false;
}

function appendRequest(idx) {
    var tBody = $('.net-table tbody');
    var req = filteredRequests[idx];
    var url = req.request.url;
    var urlSeg = url.substr(url.lastIndexOf('/') + 1);
    if (!filters.fullURLs) {
        url = url.substr(0, 100) + (url.length > 100 ? '...' : '');
        urlSeg = urlSeg.substr(0, 100) + (urlSeg.length > 100 ? '...' : '');
    }
    tBody.append('<tr data-idx="' + idx + '"><td>'+urlSeg+'<br><span style="color:gray;">'+url+'</span></td><td>'+req.response.content.mimeType+'</td><td>'+req.response.status+'</td></tr>')
}