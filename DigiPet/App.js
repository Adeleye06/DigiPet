import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { initializeDB, getHappiness, writeHappiness } from './Database';

export default function App() {
    const [happiness, setHappiness] = useState(100); 
    const [treats, setTreats] = useState(5);
    const [audio, setAudio] = useState();

    useEffect(() => {
        initializeDB();
        fetchHappiness();
        loadAudio();

        // happinness would reduce every 5 seconds
        const interval = setInterval(() => {
            setHappiness((currentHappiness) => {
                const anotherHappiness = Math.max(currentHappiness - 3, 0); 
                writeHappiness(anotherHappiness);  //write to database
                return anotherHappiness;
            });
        }, 6000);

        return () => clearInterval(interval); 
    }, []);

    const fetchHappiness = async () => {
        getHappiness(setHappiness);
    };

    const loadAudio = async () => {
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync(
            require('./assets/beat.mp3'),
            { shouldPlay: false }
        );
        setAudio(sound);
    };

    const handlePress = async () => {
        const anotherHappiness = Math.min(happiness + 10, 150); 
        writeHappiness(anotherHappiness);
        setHappiness(anotherHappiness);
        Haptics.selectionAsync();
        playSound();
    };

    const handleMakeSad = async () => {
        const anotherHappiness = Math.max(happiness - 10, 0);
        writeHappiness(anotherHappiness);
        setHappiness(anotherHappiness);
        Haptics.selectionAsync();
        playSound();
    };

    const handlePetting = async () => {
        const anotherHappiness = Math.min(happiness + 5, 150); 
        writeHappiness(anotherHappiness);
        setHappiness(anotherHappiness);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleUseTreat = () => {
        if (treats > 0) {
            setHappiness(happiness + 20); 
            setTreats(treats - 1); 
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            playSound();
        }
    };

    const playSound = async () => {
        if (audio) {
            console.log('Playing Sound');
            await audio.playAsync();
        }
    };

    const getPetImageSource = () => {
        if (happiness >= 50) {
            return require('./assets/happy.jfif');
        } else if (happiness > 30) {
            return require('./assets/neutral.jpeg');
        } else {
            return require('./assets/sad.jfif');
        }
    };

    return (
        <View style={styles.container}>
            <Image source={getPetImageSource()} style={styles.PetImage} />
            <Text style={styles.Text}>Your Pet's Happiness: {happiness}</Text>
            <View style={styles.ButtonContainer}>
                <Pressable style={styles.Button} onPress={handlePress}>
                    <Text style={styles.ButtonText}>Make Happy</Text>
                </Pressable>
                <Pressable style={styles.Button} onPress={handleMakeSad}>
                    <Text style={styles.ButtonText}>Swipe</Text>
                </Pressable>
                <Pressable style={styles.Button} onPress={handlePetting}>
                    <Text style={styles.ButtonText}>Pet Me</Text>
                </Pressable>
                <Pressable style={styles.Button} onPress={handleUseTreat}>
                    <Text style={styles.ButtonText}>Give Treat</Text>
                </Pressable>
            </View>
            <Text style={styles.Text}>Treats left: {treats}</Text>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E8EAED',
    },
    Text: {
        fontSize: 22,
        textAlign: 'center',
        marginVertical: 12,
        color: '#333',
    },
    ButtonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    Button: {
        margin: 10,
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    PetImage: {
        width: 120,
        height: 120,
        marginBottom: 24,
        borderRadius: 60,
    },
});

