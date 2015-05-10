angular.module(
    "radiobot.service.playlist",
    [
        "radiobot.service.db"
    ]
)
    .service("PlaylistService", function(DBService) {
        function PlaylistService() {
            this.getPlaylistItems = function(number) {

                var tracks = DBService.rows
                    .filter(function(row) {
                        return row.type === "track";
                    });

                var nowplaying = DBService.rows
                    .filter(function(row) {
                        return row.type === "nowplaying";
                    })
                    .reduce(function(a, b) {
                        return (
                            a.timestamp > b.timestamp ?
                                a :
                                b
                        );
                    });

                function pickNext() {
                    var myTracks = tracks.sort(function(a,b) {
                        var aScore = (
                            a.upvotes.length -
                            a.downvotes.length -
                            (
                                a.plays + next.filter(function(x) {
                                    return x === a;
                                })
                            )
                        );
                        var bScore = (
                            b.upvotes.length -
                            b.downvotes.length -
                            (
                                a.plays + next.filter(function(x) {
                                    return x === a;
                                })
                            )
                        );
                        return aScore - bScore;
                    });

                }

                var next = [];

                while (next.length < number) {
                    next.push(pickNext());
                }

                return next;
            };
        }

        return new PlaylistService();
    });
