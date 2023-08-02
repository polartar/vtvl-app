import CoreApiService from '@api-services/CoreApiService';

class TransactionApiService {
  getTransactions = (organizationId: string, chainId: number) =>
    CoreApiService.get<ITransaction[]>(`/transaction/list?organizationId=${organizationId}&chainId=${chainId}`);
  createTransaction = (data: Partial<ITransactionRequest>) => CoreApiService.post<ITransaction>('/transaction', data);
  updateTransaction = (id: string, data: Partial<ITransactionRequest>) =>
    CoreApiService.put<ITransaction>(`/transaction/${id}`, data);
}

export default new TransactionApiService();
