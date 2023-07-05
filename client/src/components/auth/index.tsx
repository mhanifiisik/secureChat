'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { authApi } from '@/api/auth-api';
import FormType from '@/constants/auth-form-type.enum';

import type { FormValues } from './models/form-values.model';

export default function AuthForm() {
  const router = useRouter();
  const [formType, setFormType] = useState<FormType>(FormType.SIGN_IN);

  const handleChangeFormType = useCallback(() => {
    if (formType === FormType.SIGN_IN) setFormType(FormType.SIGN_UP);
    else setFormType(FormType.SIGN_IN);
  }, [formType]);
  const {
    register,
    handleSubmit,
    formState: { isLoading, isSubmitting },
    reset,
  } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { email, password } = data;
    const name = data.name as string;
    try {
      const response = await (formType === FormType.SIGN_IN
        ? authApi.authenticateUser({ email, password })
        : authApi.registerUser({ name, email, password }));
      if (!response.success) {
        toast.error(`API call failed: ${response.message}`);
      } else if (formType === FormType.SIGN_IN) {
        toast.success('Successfully signed in');
        const responseToken = response.data.token as string;
        Cookies.set('token', responseToken);
        router.push('/chat');
      } else {
        toast.success('Registered successfully');
        setFormType(FormType.SIGN_IN);
      }
    } catch (error) {
      console.log(error);
    } finally {
      reset();
    }
  };
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
              {formType === FormType.SIGN_IN ? 'Sign in' : 'Sign up'}
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {formType === FormType.SIGN_UP && (
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Your name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                    placeholder="John Doe"
                    {...register('name')}
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                  placeholder="example@email.com"
                  {...register('email')}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                  {...register('password')}
                  required
                />
              </div>
              <button
                disabled={isLoading || isSubmitting}
                type="submit"
                className="focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 w-full rounded-lg bg-zinc-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-500 focus:outline-none focus:ring-4"
              >
                {formType === FormType.SIGN_IN ? 'Sign in' : 'Sign up'}
              </button>
            </form>
            <button
              onClick={handleChangeFormType}
              className="focus:ring-primary-300 dark:bg-primary-600   dark:hover:bg-primary-700 dark:focus:ring-primary-800 w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4"
            >
              {formType === FormType.SIGN_IN ? 'Create account' : 'Go back to sign in!'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
