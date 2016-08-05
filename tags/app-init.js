
riot.tag2('app-init', '<div class="mdl-layout mdl-js-layout mdl-layout--fixed-header"><header class="mdl-layout__header"><div class="mdl-layout__header-row"><span class="mdl-layout-title">HTML vs Jade</span></div></header><div class="mdl-layout__drawer"><span id="options" class="mdl-layout-title">Options</span><nav class="mdl-navigation"><div class="ui horizontal divider">Global Options</div><label for="option_ignore_error_messages" class="mdl-switch mdl-js-switch mdl-js-ripple-effect"><input id="option_ignore_error_messages" type="checkbox" onclick="{fn.refreshEditors}" class="mdl-switch__input"><span class="mdl-switch__label">Ignore Error Messages?</span></label><div class="ui horizontal divider">HTML to Jade</div><label for="option_encode_entities" class="mdl-switch mdl-js-switch mdl-js-ripple-effect"><input id="option_encode_entities" type="checkbox" onclick="{fn.refreshEditors}" checked class="mdl-switch__input"><span class="mdl-switch__label">Encode HTML Entities?</span></label><label for="option_empty_pipe" class="mdl-switch mdl-js-switch mdl-js-ripple-effect"><input id="option_empty_pipe" type="checkbox" onclick="{fn.refreshEditors}" checked class="mdl-switch__input"><span class="mdl-switch__label">No Empty Pipes?</span></label><label for="option_body_less" class="mdl-switch mdl-js-switch mdl-js-ripple-effect"><input id="option_body_less" type="checkbox" onclick="{fn.refreshEditors}" checked class="mdl-switch__input"><span class="mdl-switch__label">No Standard Html Tags?</span></label><div class="ui horizontal divider">Jade to HTML</div><label for="option_pretty_html" class="mdl-switch mdl-js-switch mdl-js-ripple-effect"><input id="option_pretty_html" type="checkbox" onclick="{fn.refreshEditors}" checked class="mdl-switch__input"><span class="mdl-switch__label">Beautify HTML?</span></label><div class="ui horizontal divider">Credits</div><div id="credits"><a href="https://github.com/donpark/html2jade"> html2jade by donpark</a><br><a href="http://jade-lang.com/"> Jade The Template Language</a><br><a href="https://ace.c9.io/"> Ace Editor By Cloud9</a><br><a href="http://semantic-ui.com/"> Semantic UI</a><br><a href="https://getmdl.io/"> Material Design Lite</a><br><a href="http://riotjs.com/"> RiotJS by Muut</a><br><div id="author" style="position:absolute; bottom: 0;">Made by<a href="https://github.com/cia48621793">cia48621793</a></div></div></nav></div><main class="mdl-layout__content"><div id="selected">Currently Selected: {obj.selected_tab}</div><div class="mdl-grid"><div class="mdl-cell mdl-cell--6-col"><div id="editor_html"></div></div><div class="mdl-cell mdl-cell--6-col"><div id="editor_jade"></div></div></div></main></div>', 'app-init #options,[riot-tag="app-init"] #options,[data-is="app-init"] #options{ margin-left: 36px; } app-init #credits,[riot-tag="app-init"] #credits,[data-is="app-init"] #credits{ margin-left: 10px; } app-init #selected,[riot-tag="app-init"] #selected,[data-is="app-init"] #selected{ position: absolute; top: 0; } app-init #editor_html,[riot-tag="app-init"] #editor_html,[data-is="app-init"] #editor_html{ position: absolute; top: 20px; bottom: 0; left: 0; width: 50%; } app-init #editor_jade,[riot-tag="app-init"] #editor_jade,[data-is="app-init"] #editor_jade{ position: absolute; top: 20px; bottom: 0; right: 0; width: 50%; }', '', function(opts) {
"use strict";
var self = this;
self.obj = {
    selected_tab: "html",
    syntax_error: false
};
self.bind('obj', self.obj);
self.on("mount", function () {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "3000",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
    $(self.editor_html).mouseover(function () {
        try {
            self.editor_html.focus();
        }
        catch (ex) {
        }
    });
    $(self.editor_jade).mouseover(function () {
        try {
            self.editor_jade.focus();
        }
        catch (ex) {
        }
    });
    self.ace_editor_html = ace.edit("editor_html");
    self.ace_editor_html.$blockScrolling = Infinity;
    self.ace_editor_html.getSession().setMode("ace/mode/html");
    self.ace_editor_html.setTheme("ace/theme/monokai");
    self.ace_editor_html.getSession().setTabSize(2);
    self.ace_editor_html.getSession().setUseWorker(true);
    self.ace_editor_html.getSession().setUseWrapMode(true);
    self.ace_editor_html.getSession().on('change', function (e) {
        self.fn.updateHtmlToJade();
    });
    self.ace_editor_html.on('focus', function (e) {
        self.obj.selected_tab = "html";
    });
    self.ace_editor_jade = ace.edit("editor_jade");
    self.ace_editor_jade.$blockScrolling = Infinity;
    self.ace_editor_jade.getSession().setMode("ace/mode/jade");
    self.ace_editor_jade.setTheme("ace/theme/monokai");
    self.ace_editor_jade.getSession().setTabSize(2);
    self.ace_editor_jade.getSession().setUseWorker(true);
    self.ace_editor_jade.getSession().setUseWrapMode(true);
    self.ace_editor_jade.getSession().on('change', function (e) {
        self.fn.updateJadeToHtml();
    });
    self.ace_editor_jade.on('focus', function (e) {
        self.obj.selected_tab = "jade";
    });
    self.ace_editor_html.setValue("<h1>Hellooooooooo!</h1>\n" +
        "<h2>This is an automatically inserted example.</h2>\n" +
        "<h3>You should be able to see this example be compiled to Jade on the right panel(or decompiled to the left).</h3>\n" +
        "<h4>This single-page-app will compile HTML to Jade (and vice versa) on-the-fly.</h4>\n" +
        "<h5>This is just an alpha prototype version, so I hope in the future we will have more features.</h5>\n" +
        "<h6>Finally, enjoy your time hacking this out! Thank you for using this app.</h6>");
});
self.fn = new (function () {
    function class_1() {
    }
    class_1.prototype.updateHtmlToJade = function () {
        if (self.obj.selected_tab !== "html") {
            return;
        }
        if (self.ace_editor_html.getValue() === '') {
            self.ace_editor_jade.setValue('');
        }
        else {
            html2jade.convertHtml(self.ace_editor_html.getValue(), {
                noemptypipe: self.option_empty_pipe.checked,
                donotencode: self.option_encode_entities.checked,
                bodyless: self.option_body_less.checked
            }, function (err, jade) {
                if (err && !self.option_ignore_error_messages.checked) {
                    toastr.error(err.toString().replace(/\n/g, '<br/>'), "Error from Html2Jade Compiler");
                    return;
                }
                self.ace_editor_jade.setValue(jade.trim());
            });
        }
    };
    class_1.prototype.updateJadeToHtml = function () {
        if (self.obj.selected_tab !== "jade") {
            return;
        }
        try {
            if (self.ace_editor_jade.getValue() === '') {
                self.ace_editor_html.setValue('');
            }
            else {
                self.ace_editor_html.setValue(jade.render(self.ace_editor_jade.getValue(), {
                    pretty: self.option_pretty_html.checked
                }).trim());
            }
        }
        catch (err) {
            if (self.option_ignore_error_messages.checked) {
                return;
            }
            toastr.error(err.toString().replace(/\n/g, '<br/>'), "Error from Jade Compiler");
        }
    };
    class_1.prototype.refreshEditors = function () {
        self.fn.updateHtmlToJade();
        self.fn.updateJadeToHtml();
    };
    return class_1;
}())();
});