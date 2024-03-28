import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { initDB, getHappiness, updateHappiness } from './Database';

export default function App() {
    const [happiness, setHappiness] = useState(100); // Default happiness level
    const [treats, setTreats] = useState(5); // Starting with 5 treats
    const [sound, setSound] = useState();

    useEffect(() => {
        initDB();
        fetchHappiness();
        loadAudio();

        // Decrease happiness every 5 seconds
        const interval = setInterval(() => {
            setHappiness((currentHappiness) => {
                const newHappiness = Math.max(currentHappiness - 3, 0); // Ensure happiness doesn't go below 0
                updateHappiness(newHappiness); // Update the database with the new happiness
                return newHappiness;
            });
        }, 5000);

        return () => clearInterval(interval); // Cleanup the interval on component unmount
    }, []);

    const fetchHappiness = async () => {
        getHappiness(setHappiness);
    };

    const loadAudio = async () => {
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync(
            require('./assets/Techbeat.mp3'),
            { shouldPlay: false }
        );
        setSound(sound);
    };

    const handlePress = async () => {
        const newHappiness = Math.min(happiness + 10, 150); // Increase happiness but cap at 150
        updateHappiness(newHappiness);
        setHappiness(newHappiness);
        Haptics.selectionAsync();
        playSound();
    };

    const handleMakeSad = async () => {
        const newHappiness = Math.max(happiness - 10, 0); // Decrease happiness but ensure it doesn't go below 0
        updateHappiness(newHappiness);
        setHappiness(newHappiness);
        Haptics.selectionAsync();
        playSound(); // Optionally play a sound here as well
    };

    const handlePetting = async () => {
        const newHappiness = Math.min(happiness + 5, 150); // Increase happiness slightly and cap at 150
        updateHappiness(newHappiness);
        setHappiness(newHappiness);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleUseTreat = () => {
        if (treats > 0) {
            setHappiness(happiness + 20); // Increase happiness by 20
            setTreats(treats - 1); // Decrease treat count
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            playSound();
        }
    };

    const playSound = async () => {
        if (sound) {
            console.log('Playing Sound');
            await sound.playAsync();
        }
    };

    const getPetImageSource = () => {
        if (happiness >= 50) {
            return require('./assets/smiling.jpeg');
        } else if (happiness > 30) {
            return require('./assets/neutral.jpeg');
        } else {
            return require('./assets/sad.jpeg');
        }
    };

    return (
        <View style={styles.container}>
            <Image source={getPetImageSource()} style={styles.petImage} />
            <Text style={styles.text}>Your Pet's Happiness: {happiness}</Text>
            <View style={styles.buttonContainer}>
                <Pressable style={styles.button} onPress={handlePress}>
                    <Text style={styles.buttonText}>Make Happy</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleMakeSad}>
                    <Text style={styles.buttonText}>Swipe</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handlePetting}>
                    <Text style={styles.buttonText}>Pet Me</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleUseTreat}>
                    <Text style={styles.buttonText}>Give Treat</Text>
                </Pressable>
            </View>
            <Text style={styles.text}>Treats left: {treats}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        margin: 10,
        backgroundColor: 'skyblue',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    petImage: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
});
