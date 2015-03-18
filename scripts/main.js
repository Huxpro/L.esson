window.templates = {};
Parse.initialize("DBBTxn0FzOUe6usgkBuLsLhyfaHNkSq7EFZtfJZT", "BkrY0KSHt86PgEravjF2hhH94sCZFlIg7urrP8UW");


var $sources = $('script[type="text/template"]');
var $welcome = $("#welcome");
var $list = $("#lessonList");
var $submit = $(".FAB");
var choosedData = [];

$submit.css({
    "webkitTransform":"scale(0)",
    "MozTransform":"scale(0)",
    "msTransform":"scale(0)"
});

$sources.each(function(index, el) {
    var $el = $(el);
    templates[$el.data('name')] = _.template($el.html());
});

var Lesson = Parse.Object.extend({
    className:"Lesson",
    defaults:{
        name:"unknown",
        teacher:"unknown",
        credit : 2,
        room:"unknown",
        choosed:false
    }
});

var Lessons = Parse.Collection.extend({
    model : Lesson
});

var lessons = new Lessons([{
    name:"Front-End",
    teacher:"WangyeZhao",
    room:"Anima201",
    credit: 4
}, {
    name:"UX Design",
    teacher:"TestTeacher"
}, {
    name : 'TestLesson1'
}, {
    name : 'TestLesson2'
}, {
    name : 'TestLesson3'
}, {
    name : 'TestLesson4'
}, {
    name : 'TestLesson5'
}, {
    name : 'TestLesson6'
}, {
    name : 'TestLesson7'
}, {
    name : 'TestLesson8'
}, {
    name : 'TestLesson9'
}]); 

var choosed = new Lessons();

// View Class
var LessonsView = Parse.View.extend({
    el:"#lessonList",
    events: {
        "click .card"    : "toggle",
    },
    initialize:function(){
        this.render();
    },
    render:function(){
        this.$el.html('');

        var compiler = templates['lesson'];
        _.each(lessons.models,function(_model){
            var html = compiler({model : _model });
            $list.append(html);
        })
    },
    toggle:function(e){
        var cid = $(e.currentTarget).toggleClass(" choosed").data('cid');
        var model = lessons.getByCid(cid);
        model.set({"choosed":!model.get("choosed")});
        this.refresh();
    },
    refresh:function(){
        choosed = new Lessons();
        _.each(lessons.models,function(_model){
            if (_model.get("choosed")) {
                choosed.add(_model);
            };
        })
        
        if (choosed.models.length >= 3) {
            $submit.css({
                "webkitTransform":"scale(1)",
                "MozTransform":"scale(1)",
                "msTransform":"scale(1)"
            });
        }else{
            $submit.css({
                "webkitTransform":"scale(0)",
                "MozTransform":"scale(0)",
                "msTransform":"scale(0)"
            });
        }
    }
})

var ChoosedView = Parse.View.extend({
    el:"#lessonList",
    render:function(){
        this.$el.html('');

        var compiler = templates['lesson'];
        _.each(choosed.models,function(_model){
            var html = compiler({model : _model });
            $list.append(html);
        })
    }
})

var AboutView = Parse.View.extend({
    el:"#lessonList",
    render:function(){
        this.$el.html('<li class="card"><h3>About</h3><p>一天完成的《多媒体交互设计二》结课作业而已。作业要求是一个「选中三门课才可提交」的选课系统。使用了 Parse 作为数据后端，使用 Backbone.js 完成前端 MVC 逻辑。主要尝试了在 Mobile-Web 中实现 Navigation Drawer 和部分 Material Design 。</p><br><p>作者：<a href="http://huxpro.github.io">黄玄</a></p></li>');

    }
})




// Business Logic
var lessonsView;
var choosedView;
var aboutView;

//button
$(".my_btn").click(function(){
    choosedView.render();
})
$(".all_btn").click(function(){
    lessonsView.render();
})
$(".about_btn").click(function(){
    aboutView.render();
})
$submit.click(function(){
    //generate Data
    _.each(choosed.models,function(_model){
        choosedData.push(_model.cid);
    })
    console.log(choosedData);

    var currentUser = Parse.User.current();
    currentUser.set("choosed",choosedData);
    currentUser.save(null,{
        success:function(user){
            alert("选课提交成功！");
        },
        error:function(user,error){
            alert("服务器正在选课……");
        }
    });
})


// logIn form
var logIn_btn = $("#login button");
var logIn_input = $('#login input');
var logIn_text = $('#login p');
logIn_btn.on('click', logIn);

function logIn(e){
    var self = this;

    if(e){
        e.preventDefault();  
    }
      
   
    logIn_text.text("正在登陆中……")

    var value = logIn_input.val();
    console.log(value)

    //Parse.User.logIn
    Parse.User.logIn(value, "mypass", {
      success: function(user) {

        //new View
        lessonsView = new LessonsView();
        choosedView = new ChoosedView();
        aboutView = new AboutView();

        //disappear Welcome Page
        $welcome.css({
            "display":"none"
        })
        //retrieve Data
        var currentUser = Parse.User.current();
        var choosedData = currentUser.get("choosed");
        console.log(choosedData);

        //recover List
        if(choosedData){   // 如果服务器上存在
             choosedData.forEach(function(value){
                _.each(lessons.models,function(_model){
                    if(_model.cid === value){
                        _model.set('choosed',true);
                    }
                })
            })
        }
       
        lessonsView.refresh();
        lessonsView.render();

      },
      error: function(user, error) {
        logIn_text.text("系统检测到该学号为第一次登陆，正在为您自动注册……")
        signUp();
      }
    });

    //SignUp
    function signUp(){
        var self = this;

        var user = new Parse.User();
        user.set("username", value);
        user.set("password", "mypass");
         
        user.signUp(null, {
          success: function(user) {
            // Hooray! Let them use the app now.
            alert("注册成功！");
            logIn();
          },
          error: function(user, error) {
            // Show the error message somewhere and let the user try again.
            alert("Error: " + error.code + " " + error.message);
         
          }
        });
    }
}


