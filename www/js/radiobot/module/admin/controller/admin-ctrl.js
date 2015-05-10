angular.module(
    "radiobot.module.admin.controller.admin",
    [
        "CornerCouch",
        "radiobot.constants",
        "radiobot.service.youtube",
        "radiobot.service.db"
    ]
)
    .controller(
        "AdminCtrl",
        function(
            $scope, cornercouch, $http,
            YoutubeService, DBService,
            COUCH_MOUNT, COUCH_DB, API_KEY_YOUTUBE
        ){
            var youtube = new YoutubeService(API_KEY_YOUTUBE);
            $scope.DBService = DBService;
            console.log(youtube);
            $scope.db = DBService;

            $scope.username = localStorage.getItem("username") || "Guest";

            $scope.$watch("username", function() {
                localStorage.setItem("username", $scope.username);
            });

            $scope.tracks = [];

            $scope.lastSeq = 0;

            $scope.$watch("newtrack", function() {
                if ($scope.newtrack) {
                    youtube.gettingInfo($scope.newtrack)
                        .then(function(response) {
                            $scope.videotitle = response.title;
                        });
                }
            });

            $scope.addTrack = function() {
                if ($scope.classifyurl($scope.newtrack) === "???") {
                    alert("Sorry\nVideo provider not recognised.\nTry Youtube links.");
                    return false;
                }

                var videoid = $scope.extractid($scope.newtrack);

                if ($scope.tracks.filter(function(track) { return track.trackid === videoid; }).length > 0) {
                    alert("Sorry\nYou've already added this track");
                    return false;
                }

                var doc = {};
                doc.user = $scope.username;
                doc.type = "track";
                doc.tracktype = $scope.classifyurl($scope.newtrack);
                doc.trackid = videoid;
                doc.upvotes = [];
                youtube.gettingInfo($scope.newtrack)
                    .then(function(response) {
                        doc.title = response.title;
                        $scope.db.save(doc);
                    });
            };

            $scope.extractid = function(url) {
                url = url || "";
                var type = $scope.classifyurl(url);
                if (type === "Youtube") {
                    var matches = url.match(/[&?]v=([a-zA-Z0-9]+)/);
                    return matches && matches[1];
                } else {
                    return "???";
                }
            };

            $scope.classifyurl = function(url) {
                url = url || "";
                if (url.indexOf("youtube") > -1) {
                    return "Youtube";
                } else {
                    return "???";
                }
            };

        }
    );
