
$(document).on('ready', function(){
  var didSearch = false;
  // web output area
  var $webLabelDiv = $('<div>').addClass('name-representative-web').text('WEB');
  var $webOutputDiv = $('<div>').addClass('output-web');
  var $outerweb = $('<div>').addClass('col-sm-12 md-padding').append($webLabelDiv,$webOutputDiv);
  // wiki output area
  var $wikiLabelDiv = $('<div>').addClass('name-representative-wiki').text('WIKI');
  var $wikiOutputDiv = $('<div>').addClass('output-wiki');
  var $outerwiki = $('<div>').addClass('col-md-4 col-sm-12 md-padding').append($wikiLabelDiv,$wikiOutputDiv);
  // image output area
  var $imageLabelDiv = $('<div>').addClass('name-representative-images').text('IMAGES');
  var $imageOutputDiv = $('<div>').addClass('output-images');
  var $outerimage = $('<div>').addClass('col-md-4 col-sm-12 md-padding').append($imageLabelDiv,$imageOutputDiv);
  // video output area
  var $videoLabelDiv = $('<div>').addClass('name-representative-videos').text('VIDEOS');
  var $videoOutputDiv = $('<div>').addClass('output-videos');
  var $outervideo = $('<div>').addClass('col-md-4 col-sm-12 md-padding').append($videoLabelDiv,$videoOutputDiv);
  // outer divs
  var $outerColDiv = $('<div>').addClass('col-xs-12').append($outerweb,$outerwiki,$outerimage,$outervideo);
  var $outputArea = $('<div>').addClass('row output-area top-buffer').append($outerColDiv);
  //target for adjusting content after the query results
  $('#target').addClass("done");


  // make all AJAX requests/Media Queries
  $(document).on('click',"#search-submit", function(){
    var query = $("#search-bar").val();
    if (didSearch) {
      // remove previous outputs
      $('.output-web').empty();
      $('.output-wiki').empty();
      $('.output-images').empty();
      $('.output-videos').empty();
    } else {
      // remove jumbotron and add output area
      $('.jumbotron').remove();
      $('.wrapper').append($outputArea);
      didSearch = true;
    }


    // wikipedia request
    $.getJSON("https://en.wikipedia.org/w/api.php?callback=?",
    {
      srsearch: query,
      action: "query",
      list: "search",
      format: "json"
    },
    function(data) {
      $(".output-wiki").empty();
      $(".search-status").text("Found results for " + query);
      $.each(data.query.search, function(i,item){
        $(".output-wiki").append("<div><a href='https://en.wikipedia.org/wiki/" + encodeURIComponent(item.title)
          + "'>" + item.title + "</a><br>" + item.snippet + "<br><br></div>");
      });
    });
  // Bing & Youtube AJAX request
  $.ajax({
      method: 'post',
      url: "https://api.datamarket.azure.com/Data.ashx/Bing/Search/Composite?Sources=%27web%2bimage%27&Query=%27"
        + query+"%27&$top=5&$format=json",
      //Set headers to authorize search with Bing
      headers: {
        'Authorization': 'Basic OjFmczZreDNEOGM5RXVvSUZ4WFh2YVVhY2llajJtbWZKcy9IK2U2d0VZSlE='
      },
      success: function(data) {
        var results = data.d.results[0]
        var restrictedDimension = $( window ).width() <= 992 ? 'height' : 'width';
          // image request
          for (i = 0; i < results.Image.length; i++) {
            let thumbnailUrl = results.Image[i].Thumbnail.MediaUrl;
            let title = results.Image[i].Title;
            let sourceUrl = results.Image[i].SourceUrl;
            let $source = $('<a>').attr('href', sourceUrl);
            let $img = $('<img>').attr('src', thumbnailUrl).attr('alt', title).attr(restrictedDimension, '200');
            let $outerDiv = $('<div>');
            $source.append($img);
            $outerDiv.append($source);
            $('.output-images').append($outerDiv);
          }
          // web request
          for (i = 0; i < 3; i++) {
            let title = results.Web[i].Title;
            let sourceUrl = results.Web[i].Url;
            let displayUrl = results.Web[i].DisplayUrl;
            let description = results.Web[i].Description;
            let $source = $('<a>').attr('href', sourceUrl).text(title);
            let $description = $('<p>').text(description);
            let $displayUrl = $('<span>').text(displayUrl);
            let $outerDiv = $('<div>').addClass('web-results col-md-4');
            $outerDiv.append($source,$description,$displayUrl);
            $('.output-web').append($outerDiv);
          }
          // video request
          function keyWordsearch(){
              gapi.client.setApiKey('AIzaSyDTzyTYYKN3YbieJjTcRBj1L8x_eU7lKY8');
              gapi.client.load('youtube', 'v3', function() {
              makeRequest();
             });
          }
          keyWordsearch();
          function makeRequest() {
             var q = $('#search-bar').val();
             var request = gapi.client.youtube.search.list({
               q: q,
               part: 'snippet',
               maxResults: 5
             });
             request.execute(function(response)  {
               console.log(JSON.stringify(response.result.items));
               var srchItems = response.result.items;
               $.each(srchItems, function(index, item) {
                 vidTitle = item.snippet.title;
                 vidId =  item.id.videoId;
                function getId(url) {
                  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  var match = url.match(regExp);
                  if (match && match[2].length == 11) {
                    return match[2];
                  } else {
                    return 'error';
                  }
                }
                var myId = getId('http://www.youtube.com/watch?v='+ vidId);
                var vidFrame = '<iframe width="350" height="155" src="//www.youtube.com/embed/'
                  + myId + '" frameborder="0" allowfullscreen></iframe>';
                $('.output-videos').append('<pre>' + vidTitle + '<br/>' + vidFrame +  '</pre>');
               })
               if ($('#target').hasClass("done")) {
                  $('#s-status').removeClass('col-md-12');
                  $('#s-status').addClass('col-md-9');
                  $('.search-bar-section').addClass('col-md-3');
                  $('.search-bar-section').append('<div class="bot-buffer top-buffer"><form class="form-search-bar"><div class="input-group"><input type="text" id="search-bar" class="form-control" placeholder="Search for..."><span class="input-group-btn"><button class="btn btn-default" id="search-submit" type="submit"><span class="glyphicon glyphicon-search"></span></button></span></div></form></div>');
                  $('#target').removeClass("done");
                  $('.wrapper').removeClass("margin-top");
               }
            })

          }
        },
        failure: function(err) {
          console.error(err);
        }
    });
    return false;
  });
});
