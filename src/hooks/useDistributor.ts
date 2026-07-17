import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createDistributor, clearDistributorError } from '../store/slices/distributorSlice';
import type { RootState } from '../store';

export const useDistributor = () => {
  const dispatch = useDispatch();

  const state = useSelector((s: RootState) => s.distributor);

  const create = useCallback(
    async (payload: Record<string, unknown>) => {
      type DistributorAction = Awaited<ReturnType<typeof dispatch>>;
      const action = (await dispatch(createDistributor(payload))) as DistributorAction;
      return action;
    },
    [dispatch],
  );

  const clearError = useCallback(() => dispatch(clearDistributorError()), [dispatch]);

  return {
    distributorState: state,
    createDistributor: create,
    clearError,
  };
};

export default useDistributor;
