(function(_, _is){

    _.icon = function( name, setNameOrObject ){
        var icons = _.icon.getSet(setNameOrObject);
        return _is.string(name) && icons.hasOwnProperty(name) ? icons[name] : null;
    };

    _.icon.sets = {
        default: {
            close: '<svg class="fg-icon fg-icon-close fg-icon-default" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M13.957 3.457l-1.414-1.414-4.543 4.543-4.543-4.543-1.414 1.414 4.543 4.543-4.543 4.543 1.414 1.414 4.543-4.543 4.543 4.543 1.414-1.414-4.543-4.543z"></path></svg>',
            prev: '<svg class="fg-icon fg-icon-prev fg-icon-default" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M10.5 16l1.5-1.5-6.5-6.5 6.5-6.5-1.5-1.5-8 8 8 8z"></path></svg>',
            next: '<svg class="fg-icon fg-icon-next fg-icon-default" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M5.5 0l-1.5 1.5 6.5 6.5-6.5 6.5 1.5 1.5 8-8-8-8z"></path></svg>',
            expand: '<svg class="fg-icon fg-icon-expand fg-icon-default" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M2 5h-2v-4c0-0.552 0.448-1 1-1h4v2h-3v3z"></path><path d="M16 5h-2v-3h-3v-2h4c0.552 0 1 0.448 1 1v4z"></path><path d="M15 16h-4v-2h3v-3h2v4c0 0.552-0.448 1-1 1z"></path><path d="M5 16h-4c-0.552 0-1-0.448-1-1v-4h2v3h3v2z"></path></svg>',
            shrink: '<svg class="fg-icon fg-icon-shrink fg-icon-default" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 0h2v4c0 0.552-0.448 1-1 1h-4v-2h3v-3z"></path><path d="M11 0h2v3h3v2h-4c-0.552 0-1-0.448-1-1v-4z"></path><path d="M12 11h4v2h-3v3h-2v-4c0-0.552 0.448-1 1-1z"></path><path d="M0 11h4c0.552 0 1 0.448 1 1v4h-2v-3h-3v-2z"></path></svg>',
            caption: '<svg class="fg-icon fg-icon-caption fg-icon-default" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 4h10v1h-10zM3 6h8v1h-8zM3 8h4v1h-4zM14.5 1h-13c-0.825 0-1.5 0.675-1.5 1.5v8c0 0.825 0.675 1.5 1.5 1.5h2.5v4l4.8-4h5.7c0.825 0 1.5-0.675 1.5-1.5v-8c0-0.825-0.675-1.5-1.5-1.5zM14 10h-5.924l-3.076 2.73v-2.73h-3v-7h12v7z"></path></svg>'
        },
        set1: {
            close: '<svg class="fg-icon fg-icon-close fg-icon-set1" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M15.854 12.854c-0-0-0-0-0-0l-4.854-4.854 4.854-4.854c0-0 0-0 0-0 0.052-0.052 0.090-0.113 0.114-0.178 0.066-0.178 0.028-0.386-0.114-0.529l-2.293-2.293c-0.143-0.143-0.351-0.181-0.529-0.114-0.065 0.024-0.126 0.062-0.178 0.114 0 0-0 0-0 0l-4.854 4.854-4.854-4.854c-0-0-0-0-0-0-0.052-0.052-0.113-0.090-0.178-0.114-0.178-0.066-0.386-0.029-0.529 0.114l-2.293 2.293c-0.143 0.143-0.181 0.351-0.114 0.529 0.024 0.065 0.062 0.126 0.114 0.178 0 0 0 0 0 0l4.854 4.854-4.854 4.854c-0 0-0 0-0 0-0.052 0.052-0.090 0.113-0.114 0.178-0.066 0.178-0.029 0.386 0.114 0.529l2.293 2.293c0.143 0.143 0.351 0.181 0.529 0.114 0.065-0.024 0.126-0.062 0.178-0.114 0-0 0-0 0-0l4.854-4.854 4.854 4.854c0 0 0 0 0 0 0.052 0.052 0.113 0.090 0.178 0.114 0.178 0.066 0.386 0.029 0.529-0.114l2.293-2.293c0.143-0.143 0.181-0.351 0.114-0.529-0.024-0.065-0.062-0.126-0.114-0.178z"></path></svg>',
            prev: '<svg class="fg-icon fg-icon-prev fg-icon-set1" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M10.5 16l3-3-5-5 5-5-3-3-8 8z"></path></svg>',
            next: '<svg class="fg-icon fg-icon-next fg-icon-set1" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M5.5 0l-3 3 5 5-5 5 3 3 8-8z"></path></svg>',
            expand: '<svg class="fg-icon fg-icon-expand fg-icon-set1" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M16 0h-6.5l2.5 2.5-3 3 1.5 1.5 3-3 2.5 2.5z"></path><path d="M16 16v-6.5l-2.5 2.5-3-3-1.5 1.5 3 3-2.5 2.5z"></path><path d="M0 16h6.5l-2.5-2.5 3-3-1.5-1.5-3 3-2.5-2.5z"></path><path d="M0 0v6.5l2.5-2.5 3 3 1.5-1.5-3-3 2.5-2.5z"></path></svg>',
            shrink: '<svg class="fg-icon fg-icon-shrink fg-icon-set1" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M9 7h6.5l-2.5-2.5 3-3-1.5-1.5-3 3-2.5-2.5z"></path><path d="M9 9v6.5l2.5-2.5 3 3 1.5-1.5-3-3 2.5-2.5z"></path><path d="M7 9h-6.5l2.5 2.5-3 3 1.5 1.5 3-3 2.5 2.5z"></path><path d="M7 7v-6.5l-2.5 2.5-3-3-1.5 1.5 3 3-2.5 2.5z"></path></svg>',
            caption: '<svg class="fg-icon fg-icon-caption fg-icon-set1" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M14.5 1h-13c-0.825 0-1.5 0.675-1.5 1.5v8c0 0.825 0.675 1.5 1.5 1.5h2.5v4l4.8-4h5.7c0.825 0 1.5-0.675 1.5-1.5v-8c0-0.825-0.675-1.5-1.5-1.5zM7 9h-4v-1h4v1zM11 7h-8v-1h8v1zM13 5h-10v-1h10v1z"></path></svg>'
        },
        set2: {
            close: '<svg class="fg-icon fg-icon-close fg-icon-set2" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M12.207 10.793l-1.414 1.414-2.793-2.793-2.793 2.793-1.414-1.414 2.793-2.793-2.793-2.793 1.414-1.414 2.793 2.793 2.793-2.793 1.414 1.414-2.793 2.793 2.793 2.793z"></path></svg>',
            prev: '<svg class="fg-icon fg-icon-prev fg-icon-set2" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M6.293 13.707l-5-5c-0.391-0.39-0.391-1.024 0-1.414l5-5c0.391-0.391 1.024-0.391 1.414 0s0.391 1.024 0 1.414l-3.293 3.293h9.586c0.552 0 1 0.448 1 1s-0.448 1-1 1h-9.586l3.293 3.293c0.195 0.195 0.293 0.451 0.293 0.707s-0.098 0.512-0.293 0.707c-0.391 0.391-1.024 0.391-1.414 0z"></path></svg>',
            next: '<svg class="fg-icon fg-icon-next fg-icon-set2" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M9.707 13.707l5-5c0.391-0.39 0.391-1.024 0-1.414l-5-5c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414l3.293 3.293h-9.586c-0.552 0-1 0.448-1 1s0.448 1 1 1h9.586l-3.293 3.293c-0.195 0.195-0.293 0.451-0.293 0.707s0.098 0.512 0.293 0.707c0.391 0.391 1.024 0.391 1.414 0z"></path></svg>',
            expand: '<svg class="fg-icon fg-icon-expand fg-icon-set2" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M16 5.5v-5.5h-5.5z"></path><path d="M5.5 0h-5.5v5.5z"></path><path d="M16 16v-5.5l-5.5 5.5z"></path><path d="M0 16h5.5l-5.5-5.5z"></path></svg>',
            shrink: '<svg class="fg-icon fg-icon-shrink fg-icon-set2" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M10 0.5v5.5h5.5z"></path><path d="M0.5 6h5.5v-5.5z"></path><path d="M10 10v5.5l5.5-5.5z"></path><path d="M6 10h-5.5l5.5 5.5z"></path></svg>',
            caption: '<svg class="fg-icon fg-icon-caption fg-icon-set2" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M13.063 1h-10.125c-1.616 0-2.938 1.322-2.938 2.938v11.063l3-3h10.063c1.616 0 2.938-1.322 2.938-2.938v-5.125c0-1.616-1.322-2.938-2.938-2.938zM14 9.063c0 0.508-0.429 0.938-0.938 0.938h-11.063v-6.063c0-0.508 0.429-0.938 0.938-0.938h10.125c0.508 0 0.938 0.429 0.938 0.938v5.125zM4 5h8v1h-8zM4 7h6v1h-6z"></path></svg>'
        }
    };

    _.icon.getSet = function( setNameOrObject ){
        if (_.icon.isSetObject(setNameOrObject)) return setNameOrObject;
        return _.icon.isSetName(setNameOrObject) ? _.icon.sets[setNameOrObject] : _.icon.sets["default"];
    };

    _.icon.isSetName = function( setName ){
        return _is.string(setName) && _.icon.sets.hasOwnProperty(setName)
    };

    _.icon.isSetObject = function( setObject ){
        if (!_is.hash(setObject)) return false;
        var names = Object.keys(_.icon.sets.default), keys = Object.keys(setObject);
        return names.every(function(name){ return keys.includes(name); });
    };

})(
    FooGallery,
    FooGallery.utils.is
);