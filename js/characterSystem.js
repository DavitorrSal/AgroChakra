/**
 * Control Farm - Character System
 * Manages the Chiribaya dog assistant and dialogue interactions
 */

class CharacterSystem {
    constructor() {
        this.currentDialogue = 0;
        this.dialogues = [
            {
                speaker: 'Chiribaya',
                text: '¡Hola! I\'m Chiribaya, your space agriculture guide! Welcome to Peru, where ancient farming wisdom meets modern satellite technology.',
                emotion: 'happy',
                duration: 4000
            },
            {
                speaker: 'Chiribaya',
                text: 'Our mission is to help local farmers in the Majes Valley improve their crop yields using satellite monitoring. This technology can detect problems before they become visible to the naked eye!',
                emotion: 'excited',
                duration: 5000
            },
            {
                speaker: 'Chiribaya',
                text: 'We\'ll analyze vegetation health, soil moisture, and temperature patterns. The LAI (Leaf Area Index) will tell us how well the crops are developing.',
                emotion: 'explaining',
                duration: 4500
            },
            {
                speaker: 'Chiribaya',
                text: 'Different environmental conditions like altitude, irrigation systems, and soil types all affect crop growth. Our satellite analysis will help farmers make better decisions!',
                emotion: 'confident',
                duration: 5000
            },
            {
                speaker: 'Chiribaya',
                text: 'After we master the techniques here in Peru, we\'ll expand our mission to help farmers across Latin America - Brazil, Argentina, and beyond! Ready to start?',
                emotion: 'determined',
                duration: 4500
            }
        ];
        
        this.characterElement = null;
        this.dialogueElement = null;
        this.isAnimating = false;
        this.typewriterSpeed = 50; // milliseconds per character
        
        this.init();
    }
    
    init() {
        this.characterElement = document.querySelector('.chiribaya-dog');
        this.dialogueElement = document.querySelector('.dialogue-content');
        this.setupCharacterAnimations();
        console.log('Character System initialized');
    }
    
    setupCharacterAnimations() {
        if (!this.characterElement) return;
        
        // Add breathing animation
        this.characterElement.style.animation = 'float 3s ease-in-out infinite';
        
        // Add blinking animation to eyes
        const eyes = this.characterElement.querySelectorAll('.eye');
        eyes.forEach(eye => {
            eye.style.animation = 'blink 4s infinite';
        });
        
        // Add subtle helmet reflection animation
        const visor = this.characterElement.querySelector('.visor');
        if (visor) {
            this.addVisorReflection(visor);
        }
    }
    
    addVisorReflection(visor) {
        // Create a subtle moving reflection on the helmet visor
        const reflection = document.createElement('div');
        reflection.style.cssText = `
            position: absolute;
            top: 20%;
            left: 20%;
            width: 30%;
            height: 30%;
            background: linear-gradient(45deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2));
            border-radius: 50%;
            animation: visorReflection 6s ease-in-out infinite;
        `;
        
        visor.appendChild(reflection);
        
        // Add CSS animation for reflection
        const style = document.createElement('style');
        style.textContent = `
            @keyframes visorReflection {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                50% { transform: translate(10px, -5px) scale(1.1); opacity: 0.3; }
            }
        `;
        document.head.appendChild(style);
    }
    
    startIntroduction() {
        this.currentDialogue = 0;
        this.showDialogue(this.dialogues[0]);
        this.animateCharacterEntry();
    }
    
    animateCharacterEntry() {
        if (!this.characterElement) return;
        
        // Character entrance animation
        this.characterElement.style.transform = 'translateX(-100px) scale(0.8)';
        this.characterElement.style.opacity = '0';
        
        setTimeout(() => {
            this.characterElement.style.transition = 'all 1s ease-out';
            this.characterElement.style.transform = 'translateX(0) scale(1)';
            this.characterElement.style.opacity = '1';
        }, 500);
        
        // Add welcome gesture
        setTimeout(() => {
            this.playGesture('wave');
        }, 1500);
    }
    
    showDialogue(dialogue) {
        if (!this.dialogueElement || this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Update speaker name
        const speakerElement = this.dialogueElement.querySelector('h3');
        if (speakerElement) {
            speakerElement.textContent = `${dialogue.speaker} says:`;
        }
        
        // Clear previous text
        const textElement = this.dialogueElement.querySelector('#dialogue-text');
        if (textElement) {
            textElement.textContent = '';
            
            // Typewriter effect
            this.typewriterEffect(textElement, dialogue.text, () => {
                this.isAnimating = false;
                this.playEmotionAnimation(dialogue.emotion);
            });
        }
        
        // Update character emotion
        this.setCharacterEmotion(dialogue.emotion);
    }
    
    typewriterEffect(element, text, callback) {
        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                
                // Add typing sound effect (visual feedback)
                this.addTypingEffect();
            } else {
                clearInterval(timer);
                if (callback) callback();
            }
        }, this.typewriterSpeed);
    }
    
    addTypingEffect() {
        // Visual feedback for typing (subtle character movement)
        if (this.characterElement) {
            this.characterElement.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.characterElement.style.transform = 'scale(1)';
            }, 100);
        }
    }
    
    setCharacterEmotion(emotion) {
        if (!this.characterElement) return;
        
        // Remove previous emotion classes
        this.characterElement.classList.remove('happy', 'excited', 'explaining', 'confident', 'determined');
        
        // Add new emotion class
        this.characterElement.classList.add(emotion);
        
        // Update facial expression
        this.updateFacialExpression(emotion);
    }
    
    updateFacialExpression(emotion) {
        const eyes = this.characterElement.querySelectorAll('.eye');
        const mouth = this.characterElement.querySelector('.mouth');
        
        if (!eyes.length || !mouth) return;
        
        switch (emotion) {
            case 'happy':
                eyes.forEach(eye => {
                    eye.style.transform = 'scaleY(0.8)'; // Squinting with joy
                });
                mouth.style.borderRadius = '0 0 20px 20px';
                mouth.style.borderWidth = '3px';
                break;
                
            case 'excited':
                eyes.forEach(eye => {
                    eye.style.transform = 'scale(1.2)'; // Wide eyes
                });
                mouth.style.borderRadius = '0 0 25px 25px';
                mouth.style.borderWidth = '4px';
                break;
                
            case 'explaining':
                eyes.forEach(eye => {
                    eye.style.transform = 'scaleY(1.1)'; // Focused look
                });
                mouth.style.borderRadius = '0 0 15px 15px';
                mouth.style.borderWidth = '2px';
                break;
                
            case 'confident':
                eyes.forEach(eye => {
                    eye.style.transform = 'scaleY(0.9)'; // Determined look
                });
                mouth.style.borderRadius = '0 0 18px 18px';
                mouth.style.borderWidth = '3px';
                break;
                
            case 'determined':
                eyes.forEach(eye => {
                    eye.style.transform = 'scaleX(0.9) scaleY(1.1)'; // Focused and determined
                });
                mouth.style.borderRadius = '0 0 22px 22px';
                mouth.style.borderWidth = '3px';
                break;
                
            default:
                eyes.forEach(eye => {
                    eye.style.transform = 'scale(1)';
                });
                mouth.style.borderRadius = '0 0 20px 20px';
                mouth.style.borderWidth = '2px';
        }
    }
    
    playEmotionAnimation(emotion) {
        if (!this.characterElement) return;
        
        switch (emotion) {
            case 'happy':
                this.bounceAnimation();
                break;
            case 'excited':
                this.shakeAnimation();
                break;
            case 'explaining':
                this.nodAnimation();
                break;
            case 'confident':
                this.proudAnimation();
                break;
            case 'determined':
                this.pumpAnimation();
                break;
        }
    }
    
    bounceAnimation() {
        this.characterElement.style.animation = 'bounce 0.6s ease-in-out 2';
        setTimeout(() => {
            this.characterElement.style.animation = 'float 3s ease-in-out infinite';
        }, 1200);
    }
    
    shakeAnimation() {
        this.characterElement.style.animation = 'shake 0.5s ease-in-out 3';
        setTimeout(() => {
            this.characterElement.style.animation = 'float 3s ease-in-out infinite';
        }, 1500);
    }
    
    nodAnimation() {
        this.characterElement.style.animation = 'nod 1s ease-in-out 2';
        setTimeout(() => {
            this.characterElement.style.animation = 'float 3s ease-in-out infinite';
        }, 2000);
    }
    
    proudAnimation() {
        this.characterElement.style.animation = 'proud 1.5s ease-in-out 1';
        setTimeout(() => {
            this.characterElement.style.animation = 'float 3s ease-in-out infinite';
        }, 1500);
    }
    
    pumpAnimation() {
        this.characterElement.style.animation = 'pump 0.8s ease-in-out 2';
        setTimeout(() => {
            this.characterElement.style.animation = 'float 3s ease-in-out infinite';
        }, 1600);
    }
    
    playGesture(gesture) {
        switch (gesture) {
            case 'wave':
                this.waveGesture();
                break;
            case 'point':
                this.pointGesture();
                break;
            case 'thumbsUp':
                this.thumbsUpGesture();
                break;
        }
    }
    
    waveGesture() {
        // Create a temporary hand element for waving
        const hand = document.createElement('div');
        hand.style.cssText = `
            position: absolute;
            top: 30%;
            right: -20px;
            width: 15px;
            height: 15px;
            background: #f0e68c;
            border-radius: 50%;
            animation: wave 1s ease-in-out 3;
        `;
        
        this.characterElement.appendChild(hand);
        
        setTimeout(() => {
            hand.remove();
        }, 3000);
    }
    
    pointGesture() {
        // Similar implementation for pointing gesture
        const pointer = document.createElement('div');
        pointer.style.cssText = `
            position: absolute;
            top: 40%;
            right: -25px;
            width: 20px;
            height: 3px;
            background: #f0e68c;
            border-radius: 2px;
            animation: point 2s ease-in-out 1;
        `;
        
        this.characterElement.appendChild(pointer);
        
        setTimeout(() => {
            pointer.remove();
        }, 2000);
    }
    
    thumbsUpGesture() {
        const thumb = document.createElement('div');
        thumb.style.cssText = `
            position: absolute;
            top: 35%;
            right: -20px;
            width: 12px;
            height: 18px;
            background: #f0e68c;
            border-radius: 6px 6px 3px 3px;
            animation: thumbsUp 1.5s ease-in-out 1;
        `;
        
        this.characterElement.appendChild(thumb);
        
        setTimeout(() => {
            thumb.remove();
        }, 1500);
    }
    
    nextDialogue() {
        if (this.isAnimating) return false;
        
        this.currentDialogue++;
        
        if (this.currentDialogue < this.dialogues.length) {
            this.showDialogue(this.dialogues[this.currentDialogue]);
            return false; // More dialogues remaining
        } else {
            // All dialogues completed
            this.playGesture('thumbsUp');
            return true; // Dialogue sequence complete
        }
    }
    
    // Mission-specific dialogue methods
    showMissionBriefing() {
        const missionDialogue = {
            speaker: 'Chiribaya',
            text: 'Now let\'s head to the Majes Valley! I\'ll guide you through analyzing the satellite data. Remember, we\'re looking for vegetation health, soil conditions, and areas that need attention.',
            emotion: 'confident',
            duration: 5000
        };
        
        this.showDialogue(missionDialogue);
    }
    
    showAnalysisHelp() {
        const helpDialogue = {
            speaker: 'Chiribaya',
            text: 'Click on the field points to select them, then choose your analysis type. NDVI shows vegetation health, LAI measures leaf coverage, and soil moisture tells us about water availability.',
            emotion: 'explaining',
            duration: 6000
        };
        
        this.showDialogue(helpDialogue);
    }
    
    showEncouragement() {
        const encouragements = [
            'Great work! You\'re getting the hang of satellite analysis!',
            'Excellent! The farmers will really benefit from this data.',
            'Perfect! You\'re becoming a real agricultural satellite expert!',
            'Outstanding analysis! This will help improve crop yields significantly.'
        ];
        
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        
        const encouragementDialogue = {
            speaker: 'Chiribaya',
            text: randomEncouragement,
            emotion: 'happy',
            duration: 3000
        };
        
        this.showDialogue(encouragementDialogue);
        this.playGesture('thumbsUp');
    }
    
    showMissionComplete() {
        const completeDialogue = {
            speaker: 'Chiribaya',
            text: '¡Excelente! You\'ve successfully completed the Peru mission! The farmers now have valuable insights to improve their crops. Ready to help more farmers across Latin America?',
            emotion: 'excited',
            duration: 5000
        };
        
        this.showDialogue(completeDialogue);
        this.playGesture('wave');
    }
    
    // Add CSS animations dynamically
    addCharacterAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes nod {
                0%, 100% { transform: rotateX(0deg); }
                50% { transform: rotateX(10deg); }
            }
            
            @keyframes proud {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05) rotateZ(2deg); }
            }
            
            @keyframes pump {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes wave {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(20deg); }
                75% { transform: rotate(-20deg); }
            }
            
            @keyframes point {
                0% { transform: translateX(0) rotate(0deg); }
                50% { transform: translateX(10px) rotate(15deg); }
                100% { transform: translateX(0) rotate(0deg); }
            }
            
            @keyframes thumbsUp {
                0% { transform: translateY(10px) scale(0.8); }
                50% { transform: translateY(-5px) scale(1.1); }
                100% { transform: translateY(0) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Utility methods
    setTypewriterSpeed(speed) {
        this.typewriterSpeed = speed;
    }
    
    skipCurrentDialogue() {
        if (this.isAnimating) {
            this.isAnimating = false;
            const textElement = this.dialogueElement.querySelector('#dialogue-text');
            if (textElement && this.currentDialogue < this.dialogues.length) {
                textElement.textContent = this.dialogues[this.currentDialogue].text;
            }
        }
    }
    
    resetCharacter() {
        this.currentDialogue = 0;
        this.isAnimating = false;
        if (this.characterElement) {
            this.characterElement.style.animation = 'float 3s ease-in-out infinite';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.CharacterSystem = new CharacterSystem();
    
    // Add character animations to the page
    if (window.CharacterSystem) {
        window.CharacterSystem.addCharacterAnimations();
    }
});