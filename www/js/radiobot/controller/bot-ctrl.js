angular.module(
    "radiobot.controller.bot",
    [
    ]
)
    .controller("BotCtrl", function(
        $scope
    ) {
        $scope.tab = "admin";
        $scope.toggleAdmin = function() {
            $scope.tab = $scope.tab === "admin" ? "player" : "admin";
        };
    });
