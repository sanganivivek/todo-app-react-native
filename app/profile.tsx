import { View, Button, Text } from 'react-native';
import { auth } from '../firebase';
import { router } from 'expo-router';

export default function Profile() {
  const user = auth.currentUser;

  const logout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  return (
    <View>
      <Text>Email: {user?.email}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
