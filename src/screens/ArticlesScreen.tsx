import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_CONFIG } from '../config/firebase';

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  likes: number;
  viewsCount: number;
  publishedAt: string;
  readTime: number;
}

type ExploreStackParamList = {
  Articles: undefined;
  ArticleDetails: { articleId: string; slug: string };
};

type ArticlesScreenProps = {
  navigation: NativeStackNavigationProp<ExploreStackParamList, 'Articles'>;
};

interface Category {
  value: string;
  label: string;
  icon?: string;
}

const ArticlesScreen = ({ navigation }: ArticlesScreenProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const filterArticles = useCallback(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        article => article.category === selectedCategory,
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags.some(tag =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    setFilteredArticles(filtered);
  }, [searchQuery, selectedCategory, articles]);

  useEffect(() => {
    filterArticles();
  }, [filterArticles]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/public/articles`,
      );
      console.log(response, 'response fetchArticles');
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити статті');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/public/articles/categories`,
      );
      console.log(response, 'fetchCategories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderArticle = ({ item }: { item: Article }) => {
    return (
      <TouchableOpacity
        style={styles.articleCard}
        onPress={() =>
          navigation.navigate('ArticleDetails', {
            articleId: item._id,
            slug: item.slug,
          })
        }
      >
        <Image
          source={{
            uri: item.coverImage || 'https://via.placeholder.com/400x200',
          }}
          style={styles.articleImage}
        />

        <View style={styles.articleContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          <Text style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.articleExcerpt} numberOfLines={3}>
            {item.excerpt}
          </Text>

          <View style={styles.articleMeta}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {item.author.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{item.author.name}</Text>
                <Text style={styles.publishedDate}>
                  {formatDate(item.publishedAt)}
                </Text>
              </View>
            </View>

            <View style={styles.stats}>
              <Text style={styles.statItem}>❤️ {item.likes}</Text>
              <Text style={styles.statItem}>👁 {item.viewsCount}</Text>
              <Text style={styles.statItem}>📖 {item.readTime} хв</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C49B63" />
        <Text style={styles.loadingText}>Завантаження статей...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук статей..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...categories]}
          keyExtractor={(item, index) => (item ? String(item) : `all-${index}`)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item && styles.categoryButtonTextActive,
                ]}
              >
                {item?.label ?? item ?? 'Всі категорії'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📰</Text>
          <Text style={styles.emptyTitle}>Статті не знайдено</Text>
          <Text style={styles.emptyText}>
            Спробуйте змінити параметри пошуку
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticle}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryButtonActive: {
    backgroundColor: '#C49B63',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E5E5',
  },
  articleContent: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C49B63',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  authorName: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  publishedDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ArticlesScreen;
