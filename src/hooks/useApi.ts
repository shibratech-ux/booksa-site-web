import {
  useMutation,
  useQuery,
  type MutationFunction,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query';

export function useApiQuery<TQueryFnData, TError = Error, TData = TQueryFnData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
    ...options
  });
}

export function useApiMutation<TData, TVariables, TError = Error>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation({
    mutationFn,
    ...options
  });
}
