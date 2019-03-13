! function($) {
    var Keypicker = function(element) {
        this.$element = $(element);
        this.$element.data('num', this.defaults.num);
        this.$picker = $(this.defaults.template).appendTo('body').on({
            click: $.proxy(this.click, this)
        });

        this.isInput = this.$element.is('input');
        this.component = this.$element.is('.keypicker') ?
            this.$element.find('.keypicker-add-on') : false;

        if (this.isInput) {
            this.$element.on({
                click: $.proxy(this.show, this),
                keyup: $.proxy(this.update, this)
            });
        } else {
            if (this.component) {
                this.component.on('click', $.proxy(this.show, this));
            } else {
                this.$element.on('click', $.proxy(this.show, this));
            }
        }

        this.update();
    };

    Keypicker.prototype = {
        constructor: Keypicker,
        show: function(e) {
            this.$picker.show();
            this.height = this.component ?
                this.component.outerHeight() : this.$element.outerHeight();

            this.place();
            $(window).on('resize', $.proxy(this.place, this));
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (!this.isInput) {}
            var that = this;
            $(document).on('mousedown', function(ev) {
                if ($(ev.target).closest('.keypicker').length == 0) {
                    that.hide();
                }
            });
            this.$element.trigger({
                type: 'show',
                data: this.num
            });
        },

        hide: function() {
            this.$picker.hide();
            $(window).off('resize', this.place);
            if (!this.isInput) {
                $(document).off('mousedown', this.hide);
            }

            this.$element.trigger({
                type: 'hide',
                data: this.num
            });
        },

        set: function() {
            var $input;

            if (!this.isInput) {
                if (this.component) {
                    $input = this.$element.find('input').val(this.num);
                }
                this.$element.data('num', this.num);
            } else {
                $input = this.$element.val(this.num);
            }

            $input && $input.trigger('change');
            $input && $input.focus();
        },

        setValue: function(data) {
            this.num = data;
            this.set();
        },

        place: function() {
            var offset = this.component ?
                this.component.offset() : this.$element.offset();
            var $width = this.component ?
                this.component.width() : this.$element.width();
            var top = offset.top + this.height;
            var left = offset.left;
            var right = $(document).width() - offset.left - $width;
            var isOutView = this.isOutView();

            this.$picker.removeClass('keypicker-right');
            this.$picker.removeClass('keypicker-up');

            if ($(document).width() > 640) {
                if (isOutView.outRight) {
                    this.$picker.addClass('keypicker-right');
                    this.$picker.css({
                        top: top,
                        left: 'auto',
                        right: right
                    });
                    return;
                }
                if (isOutView.outBottom) {
                    this.$picker.addClass('keypicker-up');
                    top = offset.top - this.$picker.outerHeight(true) - 10;
                }
            } else {
                left = 0;
            }

            this.$picker.css({
                top: top,
                left: left
            });
        },

        update: function(data) {
            this.num = (typeof data === 'string' ? data : (this.isInput ? this.$element.val() : this.$element.data('num')));
        },

        click: function(e) {
            e.stopPropagation();
            e.preventDefault();

            var target = $(e.target).closest('td, th');
            if (target.length === 1) {
                switch (target[0].nodeName.toLowerCase()) {
                    case 'td':
                        var data = $(target[0]).attr('data');
                        switch (data) {
                            case 'c':
                                if (this.num.length > 0) {
                                    this.num = this.num.substring(0, this.num.length - 1);
                                }
                                break;
                            default:
                                this.num += data;
                                break;
                        }
                        this.set();
                        break;
                }
            }
        },

        mousedown: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },

        isOutView: function() {
            var offset = this.component ?
                this.component.offset() : this.$element.offset();
            var isOutView = {
                outRight: false,
                outBottom: false
            };
            var $picker = this.$picker;
            var width = offset.left + $picker.outerWidth(true);
            var height = offset.top + $picker.outerHeight(true) +
                this.$element.innerHeight();

            if (width > $(document).width()) {
                isOutView.outRight = true;
            }
            if (height > $(document).height()) {
                isOutView.outBottom = true;
            }
            return isOutView;
        },

        defaults: {
            template: '<div class="keypicker">' +
                '<div class="keypicker-days">' +
                '<table class="keypicker-table">' +
                '<tbody>' +
                '<tr>' +
                '<td data="1" class="keypicker-key border-right">1</td>' +
                '<td data="2" class="keypicker-key border-right">2</td>' +
                '<td data="3" class="keypicker-key">3</td>' +
                '</tr>' +
                '<tr>' +
                '<td data="4" class="keypicker-key border-top border-right">4</td>' +
                '<td data="5" class="keypicker-key border-top border-right">5</td>' +
                '<td data="6" class="keypicker-key border-top">6</td>' +
                '</tr>' +
                '<tr>' +
                '<td data="7" class="keypicker-key border-top border-right">7</td>' +
                '<td data="8" class="keypicker-key border-top border-right">8</td>' +
                '<td data="9" class="keypicker-key border-top">9</td>' +
                '</tr>' +
                '<tr>' +
                '<td data="." class="keypicker-key dot border-top border-right">.</td>' +
                '<td data="0" class="keypicker-key border-top border-right">0</td>' +
                '<td data="c" class="keypicker-key delete border-top">C</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '</div>' +
                '</div>',
            onRender: function(data) {
                return '';
            },
            num: ''
        }
    }

    $.fn.keypicker = function(option, val) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('keypicker'),
                options = typeof option === 'object' && option;
            if (!data) {
                $this.data('keypicker', (data = new Keypicker(this, $.extend({}, $.fn.keypicker.defaults, options))));
            }
            if (typeof option === 'string') data[option](val);
        });
    };

    $.fn.keypicker.Constructor = Keypicker;
}(window.jQuery);