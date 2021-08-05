let bgScript = browser.runtime.connect();
shopid = null;

bgScript.onMessage.addListener(function (data) {
	if (data.action == MSG_OPEN) {
		shopid = data.message.id;
		
		if(!$("#bettershoop").length) {
		
			widget = $("<div/>"); 
			widget.attr("id", "bettershoop");
			widget.css("display", "none");
			html = '<div id="bettershoop_overlay"> \
					<div id="bettershoop_overlay_activation"> \
						<div id="bettershoop_overlay_close"></div> \
						<div id="bettershoop_overlay_logo"></div> \
						<div id="bettershoop_overlay_content"> \
							<div id="bettershoop_overlay_content_logo" style="background-image: url(\''+ data.message.logo + '\');"></div> \
							<div id="bettershoop_overlay_content_text"> \
								<div id="bettershoop_overlay_content_title">'+ data.message.name + '</div> \
								<div id="bettershoop_overlay_content_subtitle">'+ data.message.subtitle + '</div> \
							</div> \
						</div> \
						<div id="bettershoop_overlay_footer"> \
							<div id="bettershoop_overlay_mute"><div id="bettershoop_overlay_mute_eye"></div> <div id="bettershoop_overlay_mute_text">Nicht mehr anzeigen</div></div> \
						</div> \
					</div> \
				</div>';
			
			var cleanHTML = DOMPurify.sanitize(html, { SAFE_FOR_JQUERY: true });
			widget.html(cleanHTML);
			widget.append($("<style>").text("@import url('" + browser.extension.getURL("content.css") + "');"));
			widget.appendTo('body');    
			widget.fadeIn()

			$("#bettershoop_overlay_close").on("click", function () {
				bgScript.postMessage({ action: MSG_CLOSE_CALLBACK, shopid: shopid })
				closeNotify()
			});

			$("#bettershoop_overlay_mute").on("click", function () {
				bgScript.postMessage({ action: MSG_MUTE_CALLBACK, shopid: shopid })
				closeNotify()
			});
		}

	} else if (data.action == MSG_CLOSE) {
		if (shopid == data.message.shopid) {
			closeNotify()
		}
	}

});

function closeNotify() {
	$("#bettershoop").remove()
}
