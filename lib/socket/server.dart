import 'dart:io';
import 'dart:typed_data';
import 'dart:convert';
import 'package:realm/realm.dart';
import 'package:unity/dbHelper.dart';
import 'package:unity/realmUtils.dart';

class SocketServer {
  int port;

  Realm realm = getRealm();

  SocketServer(this.port);

  void init() async {
    final server = await ServerSocket.bind(InternetAddress.anyIPv4, port);
    print('Starting server.');
    server.listen((client) {
      handle(client);
    });
  }

  void handle(Socket client) {
    client.listen(
      (Uint8List data) {
        final message = String.fromCharCodes(data);
        final messageObject = json.decode(message);
        final response = handleMessageObject(messageObject);
        client.write(response);
        client.close();
      },
      onError: (error) {
        print(error);
        client.close();
      },
      onDone: () {
        client.close();
      },
    );
  }

  String handleMessageObject(messageObject) {
    // print(messageObject);
    final messageType = messageObject['messageType'];
    switch (messageType) {
      case 'syncMessage':
        final updateMessage = messageObject['updateMessage'];
        final type = updateMessage['type'];
        switch (type) {
          case 1:
            final text = updateMessage['text'];
            // print('Received text: [$text]');
            addTextItemToDb(realm, text);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    return '{"status": 0}';
  }
}
