import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:unity/util.dart';

class SocketClient {
  int port;

  SocketClient(this.port);

  void sendMessage(String message) async {
    final socket = await Socket.connect('localhost', port);
    socket.listen(
      (Uint8List data) {
        final response = String.fromCharCodes(data);
        socket.close();
        debugPrint('Response received $response');
      },
      onError: (error) {
        debugPrint(error);
        socket.destroy();
      },
      onDone: () {
        socket.destroy();
      },
    );
    socket.write(message);
  }

  void copyTextToClipboard(String text) {
    final messageObject = {
      "messageType": "updateClipboard",
      "updateMessage": {"type": 1, "text": text}
    };
    final message = json.encode(messageObject);
    debugPrint('Sending message $message');
    sendMessage(message);
  }
}
