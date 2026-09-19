window.templates = {};

var $sources = $('script[type="text/template"]');
var $welcome = $("#welcome");
var $list = $("#lessonList");
var $submit = $(".FAB");
var studentId = null;

var lessonData = [
    { name: "Front-End", teacher: "WangyeZhao", room: "Anima201", credit: 4 },
    { name: "UX Design", teacher: "TestTeacher" },
    { name: "TestLesson1" },
    { name: "TestLesson2" },
    { name: "TestLesson3" },
    { name: "TestLesson4" },
    { name: "TestLesson5" },
    { name: "TestLesson6" },
    { name: "TestLesson7" },
    { name: "TestLesson8" },
    { name: "TestLesson9" }
];

function Lesson(attributes, index) {
    this.cid = "lesson-" + index;
    this.attributes = $.extend({
        name: "unknown",
        teacher: "unknown",
        credit: 2,
        room: "unknown",
        choosed: false
    }, attributes);
}

Lesson.prototype.get = function (key) {
    return this.attributes[key];
};

Lesson.prototype.set = function (key, value) {
    this.attributes[key] = value;
};

var lessons = lessonData.map(function (attributes, index) {
    return new Lesson(attributes, index);
});

$submit.css({
    webkitTransform: "scale(0)",
    MozTransform: "scale(0)",
    msTransform: "scale(0)",
    transform: "scale(0)"
});

$sources.each(function (index, element) {
    var $element = $(element);
    templates[$element.data("name")] = _.template($element.html());
});

function selectedLessons() {
    return lessons.filter(function (lesson) {
        return lesson.get("choosed");
    });
}

function renderLessons(items) {
    var compiler = templates.lesson;
    $list.empty();
    items.forEach(function (lesson) {
        $list.append(compiler({ model: lesson }));
    });
}

function refreshSubmitButton() {
    var scale = selectedLessons().length >= 3 ? "scale(1)" : "scale(0)";
    $submit.css({
        webkitTransform: scale,
        MozTransform: scale,
        msTransform: scale,
        transform: scale
    });
}

function restoreSelection() {
    var stored = [];
    try {
        stored = JSON.parse(localStorage.getItem("lesson-selection:" + studentId)) || [];
    } catch (error) {
        stored = [];
    }

    lessons.forEach(function (lesson) {
        lesson.set("choosed", stored.indexOf(lesson.cid) !== -1);
    });
    refreshSubmitButton();
}

$list.on("click", ".card", function () {
    var cid = $(this).toggleClass("choosed").data("cid");
    var lesson = lessons.filter(function (item) {
        return item.cid === cid;
    })[0];

    if (lesson) {
        lesson.set("choosed", !lesson.get("choosed"));
        refreshSubmitButton();
    }
});

$(".my_btn").click(function (event) {
    event.preventDefault();
    renderLessons(selectedLessons());
});

$(".all_btn").click(function (event) {
    event.preventDefault();
    renderLessons(lessons);
});

$(".about_btn").click(function (event) {
    event.preventDefault();
    $list.html('<li class="card"><h3>About</h3><p>一天完成的《多媒体交互设计二》结课作业而已。作业要求是一个「选中三门课才可提交」的选课系统。课程选择保存在当前浏览器中。</p><br><p>作者：<a href="https://huxpro.github.io">黄玄</a></p></li>');
});

$submit.click(function () {
    var selectedIds = selectedLessons().map(function (lesson) {
        return lesson.cid;
    });

    try {
        localStorage.setItem("lesson-selection:" + studentId, JSON.stringify(selectedIds));
        alert("选课提交成功！");
    } catch (error) {
        alert("无法保存选课，请检查浏览器存储设置。");
    }
});

$("#login").on("submit", function (event) {
    event.preventDefault();
    studentId = $("#login input").val() || "anonymous";
    restoreSelection();
    renderLessons(lessons);
    $welcome.hide();
});
