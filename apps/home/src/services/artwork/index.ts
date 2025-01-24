import type { PaginationState } from '@tanstack/react-table';
import { handleAxiosError } from 'shared';

import type { ArtworkDownloadResponse, ArtworksResponse } from '@/interfaces';
import { CustomAxios } from '@/utils';

const getArtworks = async (param: PaginationState, searchValue: string): Promise<ArtworksResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined) {
      const { data } = await CustomAxios.get<ArtworksResponse>('/artworks');

      return data;
    }
    const { pageIndex, pageSize } = param;
    const { data } = await CustomAxios.get(
      `/artworks?page=${pageIndex}&limit=${pageSize}&sort=createdAt&search=${searchValue}`,
    );

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const downloadArtwork = async (artworkId: string): Promise<ArtworkDownloadResponse> => {
  try {
    const { data } = await CustomAxios.post<ArtworkDownloadResponse>(`/artworks/${artworkId}/download`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const artworkService = {
  getArtworks,
  downloadArtwork,
};
