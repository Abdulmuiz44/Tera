import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { teraAPI } from '@/lib/api';

export default function ToolDetailScreen() {
    const { id } = useLocalSearchParams();
    const [tool, setTool] = useState<any>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    useEffect(() => {
        loadToolData();
    }, [id]);

    const loadToolData = async () => {
        try {
            setLoading(true);
            const response = await teraAPI.getTools();
            if (response.success && response.data) {
                const foundTool = response.data.find((t: any) => t.id === id);
                setTool(foundTool);
            }
        } catch (error) {
            console.error('Failed to load tool:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async () => {
        if (!input.trim() || processing) return;

        try {
            setProcessing(true);
            setResult(null);
            const response = await teraAPI.processTool(id as string, { input });

            if (response.success && response.data?.result) {
                setResult(response.data.result);
            } else {
                setResult('Failed to process. Please try again.');
            }
        } catch (error) {
            console.error('Processing error:', error);
            setResult('An error occurred. Check your connection.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00d4ff" />
            </View>
        );
    }

    if (!tool) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Tool not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{tool.name}</Text>
                        <Text style={styles.description}>{tool.description}</Text>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Your Input</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="What do you want Tera to do?"
                            placeholderTextColor="#666"
                            value={input}
                            onChangeText={setInput}
                            multiline
                            numberOfLines={4}
                        />
                        <TouchableOpacity
                            style={[
                                styles.button,
                                (!input.trim() || processing) && styles.buttonDisabled,
                            ]}
                            onPress={handleProcess}
                            disabled={!input.trim() || processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.buttonText}>Generate Content</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {result && (
                        <View style={styles.resultContainer}>
                            <Text style={styles.resultLabel}>Result</Text>
                            <View style={styles.resultBox}>
                                <Text style={styles.resultText}>{result}</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    scrollContent: {
        padding: 20,
        gap: 24,
    },
    header: {
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#00d4ff',
    },
    description: {
        fontSize: 16,
        color: '#aaa',
        lineHeight: 24,
    },
    inputSection: {
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 120,
    },
    button: {
        backgroundColor: '#00d4ff',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    resultContainer: {
        gap: 12,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00d4ff',
        textTransform: 'uppercase',
    },
    resultBox: {
        backgroundColor: '#1a1a1a',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
    resultText: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 18,
        marginBottom: 20,
    },
    backButton: {
        color: '#00d4ff',
        fontSize: 16,
        fontWeight: '600',
    },
});
