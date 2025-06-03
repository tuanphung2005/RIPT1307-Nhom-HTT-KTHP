import { useState } from 'react';
import { message } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import type { Post } from '@/services/posts/types';
import type { AdminPostFilters } from '@/services/admin/types';
import moment from 'moment';

export default function usePostManagement() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filters, setFilters] = useState<AdminPostFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { getAllPosts, deletePost } = useModel('forum');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setFilteredPosts(allPosts);
    } catch (error) {
      message.error('Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      message.success('Xóa bài đăng thành công');
      loadPosts();
    } catch (error) {
      message.error('Không thể xóa bài đăng');
    }
  };

  const applyFilters = (posts: Post[], filters: AdminPostFilters) => {
    let filtered = [...posts];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }

    if (filters.author) {
      const author = filters.author.toLowerCase();
      filtered = filtered.filter(post => 
        post.authorName.toLowerCase().includes(author)
      );
    }

    if (filters.authorRole) {
      filtered = filtered.filter(post => post.authorRole === filters.authorRole);
    }

    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(post => {
        const postDate = moment(post.createdAt);
        return postDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }

    if (filters.minVotes !== undefined) {
      filtered = filtered.filter(post => post.votes >= filters.minVotes!);
    }
    if (filters.maxVotes !== undefined) {
      filtered = filtered.filter(post => post.votes <= filters.maxVotes!);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'votes':
          aValue = a.votes;
          bValue = b.votes;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  return {
    loading,
    posts,
    filteredPosts,
    filters,
    setFilters,
    setFilteredPosts,
    loadPosts,
    handleDeletePost,
    applyFilters,
    clearFilters
  };
}
