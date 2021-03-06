'use strict';

App.View.MapList = Backbone.View.extend({
  _template: _.template( $('#maplist_template').html() ),
  _template_item: _.template( $('#maplist_item_template').html() ),
  _template_pagination: _.template( $('#maplist_pagination_template').html() ),
  id: 'maplist',

  initialize: function(options) {

    var m = new Backbone.Model({
      section: 'maplist',
      account: this.model.get('account')
    });
    this.header = new App.View.Header({model: m});
    this.footer = new App.View.Footer();

    _.bindAll(this,'_onAccountChecked');
    this.collection = new App.Collection.Map({username: this.model.get('account')});
    this.listenTo(this.collection, 'reset', this.refreshList);
  },

  events: {
    'click .pagination a' : '_changePage',
    'click .search_tool': '_activateSearch',
    'keyup .search_input input[type=text]': '_searchMaps',
    'click .clear_search': '_clearSearchMap',
  },

  onClose: function(){
    this.stopListening();
    if (this.header)
      this.header.remove();
    if (this.footer)
      this.footer.remove();
  },

  _onAccountChecked: function(st){
    if (st){
      this.$el.html(this._template({'model': this.model.toJSON()}));
      this.$maplist = this.$('.maplist');
      this.$mapNumber = this.$('.toolbar h2 span');
      this.collection.fetch({reset: true});

      this.$searchInput = this.$('.search_input input[type=text]');
      this.$('.maplist ul').html(App.loading());
    }
    else{
      this.$el.html('User does not exist');
    }
  },
  render: function(){
    this.header.setElement($('header'));
    this.footer.setElement($('footer'));
    this.header.render();
    this.footer.render();
    // Show a loading whereas check if the account exist
    this.$el.html(App.loading());

    // App.getUserModel().checkPermissions(this.model.get('account'), function(status){
    //   if(!status){
    //     App.resetUserModel();
    //     App.router.navigate('login', {trigger: true});
    //   }
    // });
    this.model.checkAccount(this.model.get('account'),this._onAccountChecked);

    return this;
  },

  refreshList: function(){
    this.$mapNumber.html(this.collection.getNrecords());
    var $maplist_ul = this.$maplist.children('ul').first();
    $maplist_ul.empty();
    var that = this;
    var account = this.model.get('account');
    this.collection.each(function(item){
      var item_el = that._template_item({account: account , map: item.toJSON()});
      $maplist_ul.append(item_el);
    });
    if(this.collection.getNrecords() > this.collection._pageSize)
      $maplist_ul.append(this._template_pagination({'currentPage':this.collection.getCurrentPage(),'nPages':Math.ceil(this.collection.getNrecords()/this.collection._pageSize)}));
  },

  _changePage:function(e){
    e.preventDefault();
    this.collection.setCurrentPage(parseInt($(e.currentTarget).text()));
    this.$('.maplist ul').html(App.loading());
    this.collection.fetch({reset: true});
  },

  _activateSearch: function(e) {
    e.preventDefault();
    $(e.currentTarget).addClass('active');
    var _this = this;
    setTimeout(function() {
      _this.$searchInput.focus();
    }, 500);
  },

  _searchMaps: function(e) {
    if(e.keyCode == 13){
      this.collection.setCurrentQuery(this.$searchInput.val().trim());
      this.$('.maplist ul').html(App.loading());
      this.collection.fetch({reset: true});
    }
  },

  _clearSearchMap: function(e) {
    this.$('.search_tool').removeClass('active');
    this.$searchInput.val('');
    if(this.collection.getCurrentQuery() != ''){
      this.collection.setCurrentQuery('');
      this.$('.maplist ul').html(App.loading());
      this.collection.fetch({reset: true});
    }
  }

});

/*
<% if(maps){ %>
  <ul>
  <% _.each(maps, function(map){ %>
    <li><a href="<%= map.id %>"><%= map.name %></a></li>
  <% }); %>
  </ul>
<% }else{ %>
  <p>Sorry, there's no maps available</p>
<% } %>
*/
