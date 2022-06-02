import 'dart:io';
import 'dart:typed_data';

void sendMessage(String message, int port) async {
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
