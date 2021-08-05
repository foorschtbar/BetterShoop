merchantsdata = null;
let listClosed = []
let listMuted = []
let ports = []

browser.runtime.onConnect.addListener(p => {
	//console.log("add", p.sender.tab.id)
	ports[p.sender.tab.id] = p
	ports[p.sender.tab.id].onMessage.addListener(function (m) {
		if (m.shopid != null) {
			ports.forEach(p => {
				try {
					p.postMessage({
						action: MSG_CLOSE,
						message: {
							shopid: m.shopid
						}
					})
				} catch {

				}
			})
			if (m.action == MSG_CLOSE_CALLBACK) {
				index = listClosed.findIndex((e) => e.shopid === m.shopid);
				obj = {
					shopid: m.shopid,
					date: new Date()
				}

				if (index === -1) {
					listClosed.push(obj)
				} else {
					listClosed[index] = obj;
				}
			}
			if (m.action == MSG_MUTE_CALLBACK) {
				browser.storage.local.get({
					mutedshops: []
				}).then(item => {
					item.mutedshops.push(m.shopid)
					browser.storage.local.set(item)
				})
			}
		}
	});

	ports[p.sender.tab.id].onDisconnect.addListener(p => {
		//console.log("remove", p.sender.tab.id)
		//console.log("befor", ports)
		ports.splice(p.sender.tab.id, 1)
		p.onMessage.removeListener(p)
		//console.log("after", ports)
	});
});


browser.storage.onChanged.addListener((changes, area) => {
	updateMutedShops()
});

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tabInfo) {
	if (changeInfo.status == "complete") {
		checkUrl(tabId, tabInfo);
	}
});
browser.tabs.onActivated.addListener(function (activeInfo) {
	//console.log(activeInfo);
});

init();

function init() {
	updateMutedShops()
	fetchBackgroundData()
	setInterval(fetchBackgroundData, RELOAD_MERCHANTS)
};

function updateMutedShops() {
	browser.storage.local.get({
		mutedshops: []
	}).then(item => {
		listMuted = item.mutedshops
		console.log("updateMutedShops", listMuted)
	})
}

function checkUrl(tabId, tabInfo) {
	if (merchantsdata !== null) {
		for (i = 0; i < merchantsdata.length; i++) {
			if (merchantsdata[i].urlPattern != "") {
				urlPattern = merchantsdata[i].urlPattern;
				urlPattern = urlPattern.substring(1, urlPattern.length - 1);
				var patt = new RegExp(urlPattern)
				if (patt.test(tabInfo.url)) {
					//console.log(url + " matches pattern " + urlPattern);
					//console.log(merchantsdata[i]);
					//console.log(tabInfo);
					//return true;
					showNotify(tabId, merchantsdata[i]);
					return true;
				}
			}
		}
	}
	return false;
}

function fetchBackgroundData() {
	try {
		fetch(MERCHANTS_URL)
			.then(response => {
				return response.json();
			})
			.then(jsonResponse => {
				if (jsonResponse.result == "success") {
					merchantsdata = jsonResponse.message;
					console.log("fetchBackgroundData was successfull. Loaded " + merchantsdata.length + " entrys");
				}
			});
	} catch (error) {
		console.log(error)
	}
}

function showNotify(tabId, data) {
	show = true;
	shopid = data.id
	if (listMuted.find(element => element === shopid)) {
		show = false
	} else if (item = listClosed.find(element => element.shopid === shopid)) {
		timediff = ((new Date().getTime() - item.date.getTime()) / 1000)
		if (timediff <= HIDE_MSG_TIME) {
			show = false
		}
	}

	if (show) {
		ports[tabId].postMessage({
			action: MSG_OPEN,
			message: data
		})
	}
};