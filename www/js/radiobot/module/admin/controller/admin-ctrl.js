angular.module(
    "radiobot.module.admin.controller.admin",
    [
        "CornerCouch",
        "radiobot.constants"
    ]
)
    .controller(
        "AdminCtrl",
        function(
            $scope, cornercouch, $http,
            COUCH_MOUNT, COUCH_DB
        ){
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

            $scope.addTrack = function() {
                console.log($scope.newtrack);
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
