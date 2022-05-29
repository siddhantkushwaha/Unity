import 'package:realm/realm.dart';

// run below command to regenerate models.g.dart
// flutter pub run realm generate
part 'models.g.dart';

@RealmModel()
class _ClipboardItem {
  late String text;
}
