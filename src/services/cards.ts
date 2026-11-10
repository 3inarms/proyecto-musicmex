import { CardItem } from '../types/CardItem';

export const getCards = async (): Promise<CardItem[]> => {
    return [];
};

export const getCard = async (id: number): Promise<CardItem> => {
    return {} as CardItem;
};

export const createCard = async (formData: FormData): Promise<void> => {
    console.log('Creando tarjeta...');
};

export const updateCard = async (id: number | string, formData: FormData): Promise<void> => {
    console.log('Actualizando tarjeta...');
};

export const deleteCard = async (id: number | string): Promise<void> => {
    console.log('Eliminando tarjeta...');
};