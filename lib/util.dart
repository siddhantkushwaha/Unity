void debugPrint(message) {
  // ignore: avoid_print
  print(message);
}

String processText(String text) {
  if (text.startsWith("<?xml version=")) {
    text = "....";
  }
  return text;
}
