import type { Response, Service } from '@/interfaces'

import apiClient from '@/plugins/axios'

class ServicesService {
  async getServicesByApp (appId: number): Promise<Response<Service>> {
    const response = await apiClient.get('/apps/services/', {
      params: { app: appId },
    })
    return response.data
  }

  async createService (data: {
    app: number
    service_type: string
  }): Promise<Service> {
    const response = await apiClient.post('/apps/services/', data)
    return response.data
  }

  async deleteService (id: number): Promise<void> {
    await apiClient.delete(`/apps/services/${id}/`)
  }
}

export default new ServicesService()
