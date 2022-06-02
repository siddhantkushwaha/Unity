// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'models.dart';

// **************************************************************************
// RealmObjectGenerator
// **************************************************************************

class ClipboardItem extends _ClipboardItem with RealmEntity, RealmObject {
  ClipboardItem(
    String text,
    int timestamp,
  ) {
    RealmObject.set(this, 'text', text);
    RealmObject.set(this, 'timestamp', timestamp);
  }

  ClipboardItem._();

  @override
  String get text => RealmObject.get<String>(this, 'text') as String;
  @override
  set text(String value) => RealmObject.set(this, 'text', value);

  @override
  int get timestamp => RealmObject.get<int>(this, 'timestamp') as int;
  @override
  set timestamp(int value) => RealmObject.set(this, 'timestamp', value);

  @override
  Stream<RealmObjectChanges<ClipboardItem>> get changes =>
      RealmObject.getChanges<ClipboardItem>(this);

  static SchemaObject get schema => _schema ??= _initSchema();
  static SchemaObject? _schema;
  static SchemaObject _initSchema() {
    RealmObject.registerFactory(ClipboardItem._);
    return const SchemaObject(ClipboardItem, [
      SchemaProperty('text', RealmPropertyType.string),
      SchemaProperty('timestamp', RealmPropertyType.int),
    ]);
  }
}
