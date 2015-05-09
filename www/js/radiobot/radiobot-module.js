angular.module(
    "radiobot",
    [
        "radiobot.module.player",
        "radiobot.module.admin"
    ]
)
    .run(function() {
        console.log("Run");
    });
