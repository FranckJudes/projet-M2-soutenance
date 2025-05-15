import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Enregistrer l'erreur dans un service de rapport
        console.error("Erreur capturée :", error, info);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Quelque chose s'est mal passé.</h1>;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;