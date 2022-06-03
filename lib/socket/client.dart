import 'dart:io';
import 'dart:typed_data';

class SocketClient {
  int port;

  SocketClient(this.port);

  void sendMessage(String message) async {
    final socket = await Socket.connect('localhost', port);
    socket.listen(
      (Uint8List data) {
        final response = String.fromCharCodes(data);
        socket.close();
        // return response;
      },
      onError: (error) {
        print(error);
        socket.destroy();
      },
      onDone: () {
        socket.destroy();
      },
    );
    socket.write(message);
  }
}
