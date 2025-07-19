import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { addDoc, collection, onSnapshot, query, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function Todo() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(firestore, 'tasks');
    const q = query(tasksRef, where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTask = async () => {
    if (task.trim()) {
      const tasksRef = collection(firestore, 'tasks');
      if (editId) {
        const taskDoc = doc(firestore, 'tasks', editId);
        await updateDoc(taskDoc, { text: task.trim() });
        setEditId(null);
      } else {
        await addDoc(tasksRef, {
          uid: user.uid,
          text: task.trim(),
          createdAt: new Date(),
        });
      }
      setTask('');
    }
  };

  const handleEditTask = (id, currentText) => {
    setEditId(id);
    setTask(currentText);
  };

  const handleDeleteTask = async (id) => {
    try {
      const taskDoc = doc(firestore, 'tasks', id);
      await deleteDoc(taskDoc);
      Alert.alert("Deleted", "Task deleted successfully.");
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 My Tasks</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your task..."
        placeholderTextColor="#999"
        value={task}
        onChangeText={setTask}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddTask}>
        <Text style={styles.buttonText}>{editId ? 'Update Task' : 'Add Task'}</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item.text}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEditTask(item.id, item.text)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Delete Task', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDeleteTask(item.id) },
                  ])
                }
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
    elevation: 2,
  },
  button: {
    backgroundColor: '#1abc9c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editText: {
    color: '#2980b9',
    marginRight: 20,
  },
  deleteText: {
    color: '#e74c3c',
  },
});
