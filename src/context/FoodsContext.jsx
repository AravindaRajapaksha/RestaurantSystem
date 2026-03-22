/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const FoodsContext = createContext();

const normalizeFood = (food) => ({
  ...food,
  price: Number(food.price),
  discount_percent: food.discount_percent === null || food.discount_percent === undefined ? null : Number(food.discount_percent),
  is_featured_offer: Boolean(food.is_featured_offer),
});

export const FoodsProvider = ({ children }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshFoods = async () => {
    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('foods')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setFoods([]);
      setLoading(false);
      throw fetchError;
    }

    setFoods(data.map(normalizeFood));
    setLoading(false);
    return data;
  };

  useEffect(() => {
    let isMounted = true;

    const loadFoods = async () => {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('foods')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (!isMounted) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setFoods([]);
        setLoading(false);
        return;
      }

      setFoods(data.map(normalizeFood));
      setLoading(false);
    };

    loadFoods();

    return () => {
      isMounted = false;
    };
  }, []);

  const addFood = async (food) => {
    const payload = {
      ...food,
      price: Number(food.price),
      is_available: true,
      discount_percent: food.discount_percent ? Number(food.discount_percent) : null,
      offer_title: food.offer_title || null,
      offer_description: food.offer_description || null,
      is_featured_offer: Boolean(food.is_featured_offer),
    };

    const { data, error: insertError } = await supabase
      .from('foods')
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const newFood = normalizeFood(data);
    setFoods((prev) => [newFood, ...prev]);
    return newFood;
  };

  const updateFood = async (id, updatedFields) => {
    const payload = {
      ...updatedFields,
      price: Number(updatedFields.price),
      discount_percent: updatedFields.discount_percent ? Number(updatedFields.discount_percent) : null,
      offer_title: updatedFields.offer_title || null,
      offer_description: updatedFields.offer_description || null,
      is_featured_offer: Boolean(updatedFields.is_featured_offer),
    };

    const { data, error: updateError } = await supabase
      .from('foods')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    const updatedFood = normalizeFood(data);
    setFoods((prev) => prev.map((food) => (food.id === id ? updatedFood : food)));
    return updatedFood;
  };

  const deleteFood = async (id) => {
    const { error: deleteError } = await supabase
      .from('foods')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    setFoods((prev) => prev.filter((food) => food.id !== id));
  };

  return (
    <FoodsContext.Provider value={{ foods, loading, error, refreshFoods, addFood, updateFood, deleteFood }}>
      {children}
    </FoodsContext.Provider>
  );
};

export const useFoods = () => useContext(FoodsContext);
