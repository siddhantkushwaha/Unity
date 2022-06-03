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
}
