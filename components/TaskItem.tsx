import { View, Text, StyleSheet } from 'react-native';

export default function TaskItem({ task }) {
  return (
    <View style={styles.task}>
      <Text>{task.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  task: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});
