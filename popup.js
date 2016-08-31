var sTabURL = "";
var sDomain = "";
var lsr = 0; // used to determine current start number for existing page by sort
var pageSize = 1000; // max size is 1000

$(function()
{
    chrome.tabs.getSelected(null, function(tab)
		{
        handleSelectedTab(tab.url);
    });

    //button to show all columns
    $("#toggleAllColumns").click(function()
    {
        // Make this a toggle
        if($(".off").length > 0) {
            $(".off").removeClass('off');
            $(this).text("Some Columns");
        } else {
            HideColumns($("table.list"));
            $(this).text("All Columns");
        }
        return false;
    });

    $("#quickLoginChrome #toggleLoginAsFilter").change(function(event) {
      var checked = event.target.checked;

      $('td.actionColumn').each(function() {
        var $this = $(this);
        if ( checked && ! $this.hasClass('loginRow') ) {
          $this.parent().hide();
        } else {
          $this.parent().show();
        }
      });
    });

    $(document).on("click", "#quickLoginChrome div#navigationButtons a", function() {
      var $ddlView = $("#quickLoginChrome select#fcf");
      if ( $(this).html().toLowerCase().indexOf("next") >= 0 ) {
        lsr += pageSize;
      } else {
        lsr -= pageSize;
      }

      $("#quickLoginChrome #users").empty();
      $("#quickLoginChrome #loading").show();
      RequestUsers($ddlView.val(), lsr);
    });

		AttachFilterHandling();

    function handleSelectedTab(tabUrl)
    {
        sTabURL = tabUrl;
        var hostname = (new URL(tabUrl)).hostname;
        sDomain = 'https://' + hostname;
        RequestUsers("");
    }

		function AttachFilterHandling()
		{
			//case insensitive 'contains'
			jQuery.expr[':'].containsCI = function(a, i, m) {
			 return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
			};

			var typingTimer;
			var doneTypingInterval = 250;

			$("#txtFilter").keyup(function()
			{
				clearTimeout(typingTimer);
				typingTimer = setTimeout(doneTyping, doneTypingInterval);
			});

			function doneTyping ()
			{
				var sFilterText = $("#txtFilter").val();
				$("#spFilterStatus").text("Filtering");
				var $trData = $("div#users table.list tr.dataRow");
				if (sFilterText != "")
				{
					$trData.hide().filter(":containsCI('" + sFilterText + "')").show();
				}
				else
				{
					$trData.show();
				}
				$("#spFilterStatus").text("");
			}
		}

    function RequestUsers(sViewId, startNum)
    {
        var sFilter = (sViewId !== "") ? "fcf="+sViewId+"&" : "";
        var sLsr = (Number.isInteger(startNum) ? startNum : 0);
        var sUsersPage = sDomain+"/005?isUserEntityOverride=1&"+sFilter+"rowsperpage=" + pageSize + "&lsr=" + sLsr;
        $.get(sUsersPage, function(data)
        {
            html = (new DOMParser()).parseFromString(data, "text/html");

            // Figure out if there are previous/next links
            var $navigationButtons = $("#quickLoginChrome #navigationButtons");
            $navigationButtons.empty();
            var first = true;
            $(".listElementBottomNav div.next a", html).each(function() {
              var $this = $(this);
              var href = $this.attr("href");
              $this.attr("href", "#");

              if (!first) {
                $navigationButtons.append(" | ");
              } else {
                first = false;
              }
              $navigationButtons.append($this);
            });

            $("img, #allBox", html).remove();
            // Removing the attributes prevents some errors in the console
            $("tr", html).removeAttr('onblur').removeAttr('onmouseout').
                removeAttr('onfocus').removeAttr('onmouseover').not(':first').hover(
                    function() {
                        $(this).addClass('highlight');
                    },
                    function() {
                        $(this).removeClass('highlight');
                    });

            DisplayUsers(html);
        });
    }

    function HideColumns($table)
		{
        //only show first x columns?
        $("tr", $table).each(function(){
            // use a class so we can hide these while toggling rows on/off
            // This should show name, email and action buttons (if you use
            // a standard layout)
            $(this).children(':gt(3)').addClass('off');
        });
    }

    function DisplayUsers(data)
    {
        var $ddlView = $("select#fcf", data);
        // Removing the attribute prevents some errors in the console
        $ddlView.removeAttr("onchange");
        $("#viewDropdown").empty().append($ddlView);
        $ddlView.change(function()
        {
            // When we select a new set of users, clear the display
            $("#users").empty();
            $("#loading").show();
            RequestUsers($(this).val());
        });

        var $table = $("div.setupBlock table.list", data);
        HideColumns($table);

        $("#users").append($table);

        //handle login links
        $("td.actionColumn a:contains('Login')", $table).each(function()
        {
            $login = $(this);

            //flag the login links and remove other action cell elements (edit link, checkbox)
            $login.addClass("loginLink")
            .parent().addClass("loginRow").html("").append($login);

            //update login url to set target and return URL to the current url
            var sLogin = $login.attr("href");

            //strip off the retURL and targetURL
            var regexRetURL = /(&|\?)retURL=([^&]*)/;
            var regexTargetURL = /(&|\?)targetURL=([^&]*)/;
            sLogin = sLogin.replace(regexRetURL, "");
            sLogin = sLogin.replace(regexTargetURL, "");

            sLogin += sLogin.includes('?') ? '&' : '?';
            sLogin += "isUserEntityOverride=1";
            sLogin += "&retURL=" + encodeURIComponent(sTabURL);
            sLogin += "&targetURL=" + encodeURIComponent(sTabURL);

            sLogin = sDomain + sLogin;

            $login.attr("href", sLogin);
        }).click(function() {
            //update the main browser tab (not the popup) and make the main browser tab
            //active which will close the popup
            chrome.tabs.update(null, {url: $(this).attr("href"), active: true});
            window.close();
            return false;
        });

        $("th a", $table).each(function() {
            var $this = $(this);

            var href = $this.attr('href');
            if (!href.startsWith('https://') && href.startsWith('/')) {
                $this.attr("href", sDomain + href);
            }
        }).click(function(){
            //update the main browser tab (not the popup) and make the main browser tab
            //active which will close the popup
            chrome.tabs.update(null, {url: $(this).attr("href"), active: true});
            window.close();
            return false;
        });

        //Hide users who we can't login as and
        //clear out action column for users that didn't have login link
        $("td.actionColumn:not('.loginRow')").empty();
        $("#toggleAllColumns").text("All Columns");

        //disable all links except login link
        $("a:not('.loginLink')", $table).click(function()
        {
            return false;
        });

        $("#loading").hide();
        $("#menu, #users").show();

				$("#txtFilter").focus();

        //set width of table to try and prevent the popup from squishing the table
        $("body").width("800");
        $table.width($table.outerWidth());
        $("body").width("auto");
    }
});
