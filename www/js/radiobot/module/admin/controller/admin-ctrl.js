angular.module(
    "radiobot.module.admin.controller.admin",
    [
        "CornerCouch",
        "radiobot.constants",
        "radiobot.service.youtube"
    ]
)
    .controller(
        "AdminCtrl",
        function(
            $scope, cornercouch, $http,
            YoutubeService,
            COUCH_MOUNT, COUCH_DB, API_KEY_YOUTUBE
        ){
            var youtube = new YoutubeService(API_KEY_YOUTUBE);
            console.log(youtube);
            $scope.db = cornercouch(COUCH_MOUNT, "GET").getDB(COUCH_DB);

            $scope.username = localStorage.getItem("username") || "Guest";

            $scope.$watch("username", function() {
                localStorage.setItem("username", $scope.username);
            });

            $scope.tracks = [];

            $scope.refresh = function() {
                $scope.db.queryAll({ include_docs: true })
                    .then(function() {
                        console.log($scope.db.rows);
                        $scope.tracks = $scope.db.rows
                            .map(function(row) {
                                return row.doc;
                            })
                            .filter(function(row) {
                                return (
                                    row.user === $scope.username &&
                                        row.type === "track"
                                );
                            });
                    })
                    .then(function() {
                        console.log($scope.tracks);
                    });
            };

            $scope.lastSeq = 0;

            function poll() {
                $http.get(COUCH_MOUNT + "/" + COUCH_DB + "/_changes?feed=longpoll&since=" + $scope.lastSeq)
                    .then(function(response) {
                        $scope.lastSeq = response.data.last_seq;
                    })
                    .then($scope.refresh)
                    .then(poll);
            }
            poll();

            $scope.$watch("newtrack", function() {
                youtube.gettingInfo($scope.newtrack)
                    .then(function(response) {
                        $scope.videotitle = response.title;
                    });
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

                var doc = $scope.db.newDoc();
                doc.user = $scope.username;
                doc.type = "track";
                doc.tracktype = $scope.classifyurl($scope.newtrack);
                doc.trackid = videoid;
                doc.upvotes = [];
                youtube.gettingInfo($scope.newtrack)
                    .then(function(response) {
                        doc.title = response.title;
                        doc.save();
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
