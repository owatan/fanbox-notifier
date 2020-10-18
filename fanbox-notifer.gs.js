function pixivFANBOXNotifier() {
    var discordWebhookURL = "YOUR_WEBHOOK_URL_HERE"; // https://discordapp.com/api/webhooks/...

    var threads = GmailApp.search(
        "from:pixivFANBOX を公開しました is:unread"
    );

    threads.forEach(function(thread) {
        var messages = thread.getMessages();
        messages.forEach(function(message) {

            var embeds = [];
            var html = message.getBody().replace(/\r\n/g, "").replace(/\s+/g, " ");
            var mailSubject = Parser.data(html).from('<title>').to('</title>').build();
            var fanboxWriter = mailSubject.match(/^(.*)さんが/)[1];
            var fanboxTitle = mailSubject.match(/「(.*)」/)[1];
            var fanboxThumbnailUrl = Parser.data(html).from('<img src="').to('"').build();
            var fanboxRedirectUrl = Parser.data(html).from('vertical-align: top;" valign="top" > <a href="').to('"').build();
            var response = UrlFetchApp.fetch(fanboxRedirectUrl, {"followRedirects": false});
            var fanboxUrl = Parser.data(response.getContentText()).from('<a href="').to("?").build();
            var fanboxDate = message.getBody().match(/(\d+)年(\d+)月(\d+)日/)[0];

            embeds.push({
              "title": fanboxTitle,
              "url": fanboxUrl,
              "color": 16248951,
              "thumbnail": {
                "url": fanboxThumbnailUrl
              },
              "fields": [
                {
                  "name": "著者",
                  "value": fanboxWriter,
                  "inline": true
                },
                {
                  "name": "日時",
                  "value": fanboxDate,
                  "inline": true
                }
              ]
            })
            console.log(embeds);

            // POSTデータ
            var payload = {
                username: "pixivFANBOX",
                avatar_url: "https://www.fanbox.cc/favicon.ico",
                content: "🎨 pixivFANBOX に新しい投稿がありました。",
                embeds: embeds
            };

            // POSTオプション
            var options = {
                method: "POST",
                contentType: "application/json",
                payload: JSON.stringify(payload)
            };

            console.log(payload);
            var url = discordWebhookURL;
            var res = UrlFetchApp.fetch(url, options);

            message.markRead(); // Mark as read
        });
    });
}
