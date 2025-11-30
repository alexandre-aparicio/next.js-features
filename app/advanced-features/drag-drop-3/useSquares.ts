// hooks/useSquares.ts
import { useState, useCallback } from 'react';
import { Square, SquareOption } from './drag-drop';

export const useSquares = () => {
  const [squares, setSquares] = useState<Square[]>([]);

  const generateId = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

const createSquare = useCallback(() => {
  const newId = generateId();
  const newSquare: Square = {
    id: newId,
    position: { x: 50, y: 50 + squares.length * 60 },
    isUsed: false,
    inputValue: 'text',
    label: '',
    placeholder: '',
    options: [],
    selectType: 'single',
  };
  setSquares(prev => [...prev, newSquare]);
  return newSquare;
}, [squares.length]);

const updateSquareSelectType = useCallback((squareId: string, value: 'single' | 'multiple') => {
  setSquares(prev => prev.map(square => 
    square.id === squareId ? { ...square, selectType: value } : square
  ));
}, []);

  const updateSquareInput = useCallback((squareId: string, value: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, inputValue: value } : square
    ));
  }, []);

  const updateSquareLabel = useCallback((squareId: string, value: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, label: value } : square
    ));
  }, []);

  const updateSquarePlaceholder = useCallback((squareId: string, value: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, placeholder: value } : square
    ));
  }, []);

  const addSquareOption = useCallback((squareId: string, option: SquareOption) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId 
        ? { ...square, options: [...square.options, option] }
        : square
    ));
  }, []);

  const updateSquareOption = useCallback((squareId: string, optionId: string, updates: Partial<SquareOption>) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId 
        ? { 
            ...square, 
            options: square.options.map(opt => 
              opt.id === optionId ? { ...opt, ...updates } : opt
            )
          }
        : square
    ));
  }, []);

  const deleteSquareOption = useCallback((squareId: string, optionId: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId 
        ? { 
            ...square, 
            options: square.options.filter(opt => opt.id !== optionId)
          }
        : square
    ));
  }, []);

  const deleteSquare = useCallback((squareId: string) => {
    setSquares(prev => prev.filter(square => square.id !== squareId));
  }, []);

  const markSquareAsUsed = useCallback((squareId: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, isUsed: true } : square
    ));
  }, []);

  const markSquareAsUnused = useCallback((squareId: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, isUsed: false } : square
    ));
  }, []);

  const getAvailableSquares = useCallback(() => {
    return squares.filter(square => !square.isUsed);
  }, [squares]);

  const getSquareById = useCallback((id: string) => {
    return squares.find(square => square.id === id);
  }, [squares]);

  return {
    squares,
    availableSquares: getAvailableSquares(),
    createSquare,
    updateSquareInput,
    updateSquareSelectType,
    updateSquareLabel,
    updateSquarePlaceholder,
    addSquareOption,
    updateSquareOption,
    deleteSquareOption,
    deleteSquare,
    markSquareAsUsed,
    markSquareAsUnused,
    getSquareById
  };
};