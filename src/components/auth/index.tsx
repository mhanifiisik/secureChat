'use client';

import type { AxiosError } from 'axios';
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

  const onSubmit: SubmitHandler<FormValues> = async (data, event) => {
    event?.preventDefault();
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
      const err = error as AxiosError;
      toast.error(err.message);
    } finally {
      reset();
    }
  };
  return (
    <section className="min-h-screen w-full bg-gray-900">
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <div className="w-full rounded-lg  border border-gray-700 bg-gray-800 shadow sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-center text-xl font-bold leading-tight tracking-tight  text-white md:text-2xl">
              {formType === FormType.SIGN_IN ? 'Sign in' : 'Sign up'}
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {formType === FormType.SIGN_UP && (
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium  text-white">
                    Your name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className=" block w-full rounded-lg border border-gray-600  bg-gray-700 p-2.5 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="John Doe"
                    {...register('name')}
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium  text-white">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  className=" block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5  text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="example@email.com"
                  {...register('email')}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium  text-white">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className=" block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5  text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  {...register('password')}
                  required
                />
              </div>
              <button
                disabled={isLoading || isSubmitting}
                type="submit"
                className="mb-2 mr-2 w-full rounded-lg border  border-gray-600 bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-400  hover:bg-gray-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-700"
              >
                {formType === FormType.SIGN_IN ? 'Sign in' : 'Sign up'}
              </button>
            </form>
            <button
              onClick={handleChangeFormType}
              className="mb-2 mr-2  w-full rounded-lg border  border-gray-600 bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-400  hover:bg-gray-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-700"
            >
              {formType === FormType.SIGN_IN ? 'Create account' : 'Go back to sign in!'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
