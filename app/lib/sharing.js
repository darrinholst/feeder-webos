var Sharing = {
  
  //variables in use up to ax
  items: [
    {id: "sharing-aa", label: $L("Reader"), defaultEnabled: true},
    {id: "sharing-ab", label: $L("Share"), command: "share-with-google", defaultEnabled: false},
    {id: "sharing-at", label: $L("Clipboard"), defaultEnabled: true},
    {id: "sharing-au", label: $L("Copy URL"), command: "send-to-clipboard", defaultEnabled: true},
    {id: "sharing-ac", label: $L("Twitter"), defaultEnabled: true},
    {id: "sharing-ad", label: $L("Project Macaw"), command: "send-to-project-macaw", defaultEnabled: true},
    {id: "sharing-aw", label: $L("Spaz HD"), command: "send-to-spaz-hd", defaultEnabled: false},
    {id: "sharing-ax", label: $L("Spaz Beta"), command: "send-to-spaz-beta", defaultEnabled: false},
    {id: "sharing-ae", label: $L("Glimpse"), command: "send-to-glimpse", defaultEnabled: true},
    {id: "sharing-av", label: $L("Browser"), command: "send-to-browser", defaultEnabled: true},
    {id: "sharing-aq", label: $L("Quick Post"), defaultEnabled: true},
    {id: "sharing-ar", label: $L("Default Accounts"), command: "send-to-qp-default", defaultEnabled: true},
    {id: "sharing-as", label: $L("All Accounts"), command: "send-to-qp-all", defaultEnabled: true},
    {id: "sharing-af", label: $L("Share"), defaultEnabled: true},
    {id: "sharing-ag", label: $L("Facebook"), command: "send-to-facebook", defaultEnabled: true},
    {id: "sharing-ah", label: $L("Email"), command: "send-to-email", defaultEnabled: true},
    {id: "sharing-ai", label: $L("SMS"), command: "send-to-sms", defaultEnabled: true},
    {id: "sharing-ap", label: $L("neato!"), command: "send-to-neato", defaultEnabled: false},
    {id: "sharing-aj", label: $L("Read Later"), defaultEnabled: true},
    {id: "sharing-ak", label: $L("Relego"), command: "send-to-relego", defaultEnabled: true},
    {id: "sharing-al", label: $L("Spare Time"), command: "send-to-spare-time", defaultEnabled: false},
    {id: "sharing-am", label: $L("Instapaper"), command: "send-to-instapaper", defaultEnabled: true},
    {id: "sharing-an", label: $L("ReadOnTouch PHONE"), command: "send-to-readontouch-phone", defaultEnabled: false},
    {id: "sharing-ao", label: $L("ReadOnTouch PRO"), command: "send-to-readontouch-pro", defaultEnabled: false},
    {id: "sharing-ay", label: $L("MoboReader"), command: "send-to-mobo-reader", defaultEnabled: false}
  ],
  
  getPopupFor: function(article) {
    var sortOrder = Preferences.getSharingOptionsSortOrder()
    console.log(sortOrder)

    if(sortOrder.length) {
      sortOrder.each(function(id, i) {
        Sharing.items.each(function(item) {
          if(item.id == id) {
            item.sortKey = i
            throw $break
          }
        })
      })

      Sharing.items = Sharing.items.sortBy(function(i) {return i.sortKey})
    }

    var popupItems = []
    var parentGroup

    var addGroup = function(group) {
      if(parentGroup && parentGroup.items) {
        popupItems.push(parentGroup)
      }

      parentGroup = group
    }

    var addItem = function(item) {
      if(parentGroup) {
        parentGroup.items = parentGroup.items || []
        parentGroup.items.push(item)
      }
      else {
        popupItems.push(item)
      }
    }

    Sharing.items.each(function(item) {
      if(Preferences.isSharingOptionEnabled(item.id, item.defaultEnabled)) {
        item = Object.clone(item)

        if(item.command) {
          if(item.command == "share-with-google" && article.isShared) {
            item.command = "unshare-with-google"
            item.label = $L("Unshare")
          }

          addItem(item)
        }
        else {
          addGroup(item)
        }
      }
    })

    if(parentGroup && parentGroup.items) {
      popupItems.push(parentGroup)
    }

    popupItems.push({label: $L("Configure..."), command: "configure"})

    return popupItems
  },

  handleSelection: function(article, controller, command) {
    switch(command) {
      case "share-with-google":   Sharing.shareWithGoogle(article, controller); break;
      case "unshare-with-google": Sharing.unshareWithGoogle(article, controller); break;
      case "send-to-instapaper":  Sharing.sendToInstapaper(article, controller); break;
      case "send-to-readontouch-phone": Sharing.sendToReadontouchPhone(article, controller); break;
      case "send-to-readontouch-pro": Sharing.sendToReadontouchPro(article, controller); break;
      case "send-to-spare-time":  Sharing.sendToSpareTime(article, controller); break;
      case "send-to-relego":      Sharing.sendToRelego(article, controller); break;
      case "send-to-project-macaw":   Sharing.sendToProjectMacaw(article, controller); break;
      case "send-to-glimpse":        Sharing.sendToGlimpse(article, controller); break;
      case "send-to-qp-default":       Sharing.sendToQPDefault(article, controller); break;
      case "send-to-qp-all":      Sharing.sendToQPAll(article, controller); break;
      case "send-to-email":       Sharing.sendToEmail(article, controller); break;
      case "send-to-sms":         Sharing.sendToSms(article, controller); break;
      case "send-to-neato":       Sharing.sendToNeato(article, controller); break;
      case "send-to-facebook":    Sharing.sendToFacebook(article, controller); break;
      case "send-to-clipboard":   Sharing.sendToClipboard(article, controller); break;
      case "send-to-browser":     Sharing.sendToBrowser(article, controller); break;
      case "send-to-spaz-hd":     Sharing.sendToSpazHD(article, controller); break;
      case "send-to-spaz-beta":     Sharing.sendToSpazBeta(article, controller); break;
      case "send-to-mobo-reader":  Sharing.sendToMoboReader(article, controller); break;
      case "configure":           controller.stageController.pushScene("configure-sharing", Sharing.items)
    }
  },

  shareWithGoogle: function(article, controller) {
    article.turnShareOn(function() {
      Feeder.notify($L("Article shared"))
    })
  },

  unshareWithGoogle: function(article, controller) {
    article.turnShareOff(function() {
      Feeder.notify($L("Article unshared"))
    })
  },

  sendToFacebook: function(article, controller, shorturl) {
  	if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToFacebook")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
    Sharing.sendToApp(controller, $L("Facebook"), "com.palm.app.facebook", {status: article.title + "\n\n" + url})
  },

  sendToProjectMacaw: function(article, controller, shorturl) {
  	if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToProjectMacaw")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
    Sharing.sendToApp(controller, $L("Project Macaw"), "net.minego.phnx", {action: "tweet", msg: article.title + "\n\n" + url})
  },

  sendToGlimpse: function(article, controller, shorturl) {
    if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToGlimpse")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
    Sharing.sendToApp(controller, $L("Glimpse"), "com.ingloriousapps.glimpse", {query: "tweet/" + article.title + "\n\n" + url})
  },

  sendToQPDefault: function(article, controller, shorturl) {
    if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToQPDefault")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
    Sharing.sendToApp(controller, $L("Default Accounts"), "com.hedami.quickpost", {quickPost: article.title + "\n\n" + url})
  },

  sendToQPAll: function(article, controller, shorturl) {
    if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToQPAll")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
    Sharing.sendToApp(controller, $L("All Accounts"), "com.hedami.quickpost", {quickPost: "z " + article.title + "\n\n" + url})
  },

  sendToInstapaper: function(article, controller) {
    var success = function() {
      Feeder.notify($L("Article saved to Instapaper"))
    }

    var credentials = function() {
      controller.stageController.pushScene("instapaper-credentials", Sharing.sendToInstapaper.curry(article, controller))
    }

    var failure = function() {
      Feeder.notify($L("Unable to save article"))
    }

    Instapaper.send(article.url, article.title, success, credentials, failure)
  },

  sendToSpareTime: function(article, controller) {
    Sharing.sendToApp(controller, $L("Spare Time"), "com.semicolonapps.sparetime", {action: "add_url", url: article.url, title: article.title})
  },

  sendToRelego: function(article, controller) {
    Sharing.sendToApp(controller, $L("Relego"), "com.webosroundup.relego", {action: 'addtorelego', url: article.url, title: article.title})
  },

  sendToEmail: function(article, controller, shorturl) {
  	if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToEmail")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
    Sharing.sendToApp(controller, $L("Email"), "com.palm.app.email", {summary: article.title, text: article.title + "\n\n" + url})
  },

  sendToSms: function(article, controller, shorturl) {
   	if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToSms")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url   
    Sharing.sendToApp(controller, $L("Messaging"), "com.palm.app.messaging", {messageText: article.title + "\n\n" + url})
  },

  sendToNeato: function(article, controller) {
    Sharing.sendToApp(controller, $L("neato!"), "com.zhephree.neato", {send: '{"a":"url","c":"'+article.url+'"}'})
  },

  sendToReadontouchPhone: function(article, controller) {
    Sharing.sendToApp(controller, $L("ReadOnTouch PHONE"), "com.sven-ziegler.readontouch-phone", {action: 'addLink', url: article.url, title: article.title})
  },

  sendToReadontouchPro: function(article, controller) {
    Sharing.sendToApp(controller, $L("ReadOnTouch PRO"), "com.sven-ziegler.readontouch", {action: 'addLink', url: article.url, title: article.title})
  },
  

  sendToMoboReader: function(article, controller) {
    Sharing.sendToApp(controller, $L("MoboReader"), "info.mobo.moboreader", {action: 'addLink', url: article.url, title: article.title})
  },

  sendToClipboard: function(article, controller) {
    controller.stageController.setClipboard(article.url)
    Feeder.notify($L("URL Copied"))
  },
  
  sendToBrowser: function(article, controller, shorturl) {
  	if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToBrowser")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
  	Sharing.sendToApp(controller, $L("Browser"), "com.palm.app.browser", {target: "https://twitter.com/intent/tweet?text=" + encodeURIComponent(article.title) + "&url=" + encodeURI(url)})
  },
  
  sendToSpazHD: function(article, controller, shorturl) {
  	if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToSpazHD")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
    Sharing.sendToApp(controller, $L("Spaz HD"), "com.funkatron.app.spaz-hd", {action: "prepPost", tweet: article.title + "\n\n" + url})
  },
  
  sendToSpazBeta: function(article, controller, shorturl) {
  	if(Preferences.isShortenURLs() && !shorturl)
  	{
  		Sharing.getShortURL(article, controller, article.url, "sendToSpazBeta")
  		return
  	}
  	
  	var url = shorturl ? shorturl : article.url
    Sharing.sendToApp(controller, $L("Spaz Beta"), "com.funkatron.app.spaz-beta", {action: "prepPost", tweet: article.title + "\n\n" + url})
  },
  
  getShortURL: function(article, controller, url, method)
  {
	new Ajax.Request("http://is.gd/create.php", {
	method: "get",
	parameters: {format: "json", url: encodeURI(url)},
	onSuccess: function(response){
		shorturl = response.responseText.evalJSON().shorturl
		Sharing[method](article, controller, shorturl)
	},
		onFailure: function(){Sharing[method](article, controller, url)}
	})
  },

  sendToApp: function(controller, appName, id, params) {
    controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",
      parameters: {id: id, params: params},
      onFailure: Sharing.offerToInstallApp.curry(appName, id, controller)
    })
  },

  offerToInstallApp: function(name, id, controller) {
    controller.showAlertDialog({
      title:$L("#{app} is not installed").interpolate({app: name}),
      message: $L("#{app} is not installed. Would you like to install it?").interpolate({app: name}),

      choices:[
        {label:$L("Yes"), value:"yes", type:"affirmative"},
        {label:$L("No"), value:"no", type:"dismissal"}
      ],

      onChoose: function(value){
        if("yes" == value){
          controller.serviceRequest("palm://com.palm.applicationManager", {
            method:"open",
            parameters:{target: "http://developer.palm.com/appredirect/?packageid=" + id}
          })
        }
      }
    })
  }
}

