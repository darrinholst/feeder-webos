var AllSources = Class.create({
  initialize: function(api) {
    this.stickySources = {items: []}

    if (api.supportsAllArticles())
    {
    	this.all = new AllArticles(api)
    	this.stickySources.items.push(this.all)
    }
    
    if (api.supportsFresh())
    {
    	this.fresh = new Fresh(api)
    	this.stickySources.items.push(this.fresh)
    }
     
    if (api.supportsStarred())
    {
    	this.starred = new Starred(api)
    	this.stickySources.items.push(this.starred)
    }
    
    if (api.supportsShared())
    {
    	this.shared = new Shared(api)
    	this.stickySources.items.push(this.shared)
    }
    
    if (api.supportsArchived())
    {
    	this.archived = new Archived(api)
    	this.stickySources.items.push(this.archived)
    }
    
    this.subscriptions = new AllSubscriptions(api)
    this.subscriptionSources = {items: []}
  },

  findAll: function(success, failure) {
    var self = this

    self.subscriptions.findAll(
      function() {
        self.all.setUnreadCount(self.subscriptions.getUnreadCount())
        success()
      },

      failure
    )
  },

  sortAndFilter: function(success, failure) {
    var self = this
    self.subscriptionSources.items.clear()

    self.subscriptions.sort(
      function() {
        var hideReadFeeds = Preferences.hideReadFeeds()

        self.subscriptions.items.each(function(subscription) {
          if(!hideReadFeeds || (hideReadFeeds && subscription.unreadCount)) {
            self.subscriptionSources.items.push(subscription)
          }
        })

        success()
      },

      failure
    )
  },

  articleRead: function(subscriptionId) {
    this.all.decrementUnreadCountBy(1)
    this.subscriptions.articleRead(subscriptionId)
  },

  articleNotRead: function(subscriptionId) {
    this.all.incrementUnreadCountBy(1)
    this.subscriptions.articleNotRead(subscriptionId)
  },

  markedAllRead: function(count) {
    this.all.decrementUnreadCountBy(count)
    this.subscriptions.recalculateFolderCounts()
  },

  nukedEmAll: function() {
    this.all.clearUnreadCount()

    Log.debug("Marked EVERYTHING read")

    this.subscriptions.items.each(function(item) {
      Log.debug("Marking " + item.id + " read")

      if(item.isFolder) {
        item.subscriptions.items.each(function(subscription) {
          subscription.clearUnreadCount()
        })

        item.recalculateUnreadCounts()
      }
      else {
        item.clearUnreadCount()
      }
    })
  }
})
