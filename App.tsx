import React, { useState, useEffect, useCallback } from 'react';
import { Search, Zap, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { AppState } from './types';

type InitialRepo = {
	url: string;
};

// Default sources to search from (fallback if remote config fails)
const INITIAL_REPOS: InitialRepo[] = [
	{ url: 'https://kgfixed.github.io/vocab.nerc.ac.uk/P02/latest.ttl' },
	{ url: 'https://kgfixed.github.io/vocab.nerc.ac.uk/P06/latest.ttl' },
	{ url: 'https://kgfixed.github.io/vocab.nerc.ac.uk/S25/latest.ttl' }
];

// Example remote config URL for initial repos
const INITIAL_REPOS_URL = 'https://raw.githubusercontent.com/kgFixed/kgFixed.github.io/refs/heads/main/feeds.json';

const App: React.FC = () => {
	const [state, setState] = useState<AppState>({
		feeds: [],
		selectedFeed: null,
	});
	const [initialRepos, setInitialRepos] = useState<InitialRepo[]>(INITIAL_REPOS);
	const [searchQuery, setSearchQuery] = useState('');
	const [isRefreshing, setIsRefreshing] = useState(false);

	const fetchInitialRepos = useCallback(async () => {
		try {
			const response = await fetch(INITIAL_REPOS_URL);
			if (!response.ok) {
				throw new Error(`Failed to fetch initial repos: ${response.statusText}`);
			}
			const data = await response.json();
			if (!Array.isArray(data)) {
				throw new Error('Initial repos payload must be an array');
			}

			const typedData = data as Array<Partial<InitialRepo>>;
			const repos: InitialRepo[] = typedData
				.map(item => ({
					url: typeof item.url === 'string' ? item.url.trim() : '',
				}))
				.filter(item => item.url.length > 0);

			if (repos.length === 0) {
				throw new Error('Initial repos payload contained no valid urls');
			}

			return repos;
		} catch (error) {
			console.error('Failed to fetch initial repos, using fallback list', error);
			return INITIAL_REPOS;
		}
	}, []);

	const buildExplorerUrl = useCallback((feedUrl: string) => {
		return `https://xplorer.ajuvercr.be/ldes/${encodeURIComponent(feedUrl)}`;
	}, []);

	const loadFeed = useCallback(async (url: string, forceRefresh = false) => {
		const existingFeed = state.feeds.find(f => f.baseUrl === url);
		if (existingFeed && !forceRefresh && existingFeed.members.length > 0) return;

		const fragmentUrl = url;

		setState(prev => {
			const nextFeeds = prev.feeds.filter(feed => feed.baseUrl !== url);
			return {
				...prev,
				feeds: [
					...nextFeeds,
					{
						baseUrl: url,
						latestTtlUrl: fragmentUrl,
						title: url,
						members: [],
						loading: false,
						statusMessage: undefined,
						error: undefined,
					},
				],
			};
		});
	}, [state.feeds]);

	const refreshAll = useCallback(async () => {
		setIsRefreshing(true);
		setState({ feeds: [], selectedFeed: null });
		const repoConfigs = await fetchInitialRepos();
		setInitialRepos(repoConfigs);
		for (const repo of repoConfigs) {
			await loadFeed(repo.url, true);
		}
		setIsRefreshing(false);
	}, [fetchInitialRepos, loadFeed]);

	useEffect(() => {
		refreshAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const activeFeed = state.feeds.find(f => f.baseUrl === state.selectedFeed);
	const filteredRepos = initialRepos.filter(repo =>
		repo.url.toLowerCase().includes(searchQuery.trim().toLowerCase())
	);

	return (
		<div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,var(--vliz-ice),#ffffff_45%,var(--vliz-sand))] text-[var(--vliz-ink)]">
			{/* Navbar */}
			<nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--vliz-mist)]">
				<div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-2">
							<div className="bg-[#354d9b] p-1.5 rounded-lg">
								<Zap size={20} className="text-white fill-white" />
							</div>
							<span className="text-xl font-black tracking-tighter text-[var(--vliz-ink)]">KgFixed LDES Navigator</span>
						</div>

						<div className="flex items-center gap-4">
							<div className="hidden md:flex items-center relative group">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search repositories..."
									className="w-64 pl-10 pr-4 py-2 bg-[var(--vliz-ice)] border-none rounded-full text-sm focus:ring-2 focus:ring-[#354d9b] transition-all focus:w-80 outline-none"
								/>
								<Search size={16} className="absolute left-3.5 text-slate-400" />
							</div>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-[1600px] mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Left Panel: Repository Catalog */}
					<div className="lg:col-span-4 space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-sm font-bold text-[var(--vliz-blue)] uppercase tracking-widest flex items-center gap-2">
									KgFixed Catalog Of Feeds
								</h2>
								<p className="text-xs text-slate-400">Configured sources and stats</p>
							</div>
							<div className="text-right">
								<span className="text-xs bg-[var(--vliz-ice)] text-[var(--vliz-blue)] px-2 py-0.5 rounded-full font-bold">
									{initialRepos.length}
								</span>
							</div>
						</div>

						<div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
							{filteredRepos.map(repo => {
								const isLoaded = state.feeds.some(feed => feed.baseUrl === repo.url);
								const isActive = state.selectedFeed === repo.url;

								return (
									<button
										key={repo.url}
										onClick={() => {
											loadFeed(repo.url, true);
											setState(prev => ({ ...prev, selectedFeed: repo.url }));
										}}
										className={`w-full text-left rounded-2xl border transition-all group ${
											isActive
												? 'border-[#354d9b] bg-white shadow-lg shadow-blue-100'
												: 'border-[var(--vliz-mist)] bg-white/95 hover:border-[#354d9b]/50 hover:shadow-md'
										}`}
									>
										<div className="p-4">
											<div className="flex items-start justify-between gap-3">
												<div>
													<p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Repository</p>
													<h3 className="text-sm font-semibold text-slate-800 break-all mt-1">
														{repo.url}
													</h3>
												</div>
												<span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
													isLoaded
														? 'bg-[#e6f4f1] text-[#1f6f7a]'
														: 'bg-[#fff2e8] text-[#c45c24]'
												}`}>
													{isLoaded ? 'Loaded' : 'Idle'}
												</span>
											</div>
										</div>
									</button>
								);
							})}

							{filteredRepos.length === 0 && !isRefreshing && (
								<div className="text-center py-12 px-4 border-2 border-dashed rounded-xl border-[var(--vliz-mist)] text-slate-400">
									<AlertCircle size={40} className="mx-auto mb-3 opacity-20" />
									<p>
										{searchQuery.trim().length > 0
											? 'No repositories match your search.'
											: 'No repositories found. Try refresh to reload the catalog.'}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Right Panel: Explorer */}
					<div className="lg:col-span-8">
						{activeFeed ? (
							<div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
								<div className="bg-white rounded-2xl border border-[var(--vliz-mist)] shadow-sm p-6 lg:p-8">
									<div className="mb-8">
										<div className="flex items-center gap-2 text-[#354d9b] mb-2">
											<span className="text-xs font-bold uppercase tracking-widest">Selected Fragment Explorer</span>
										</div>
										<h1 className="text-3xl font-extrabold text-slate-900 mb-2">{activeFeed.title}</h1>
										<div className="flex flex-wrap gap-4 items-center text-sm text-slate-500">
											<a href={activeFeed.latestTtlUrl} target="_blank" rel="noreferrer" className="text-[#354d9b] hover:underline font-medium">Open TTL</a>
										</div>
									</div>

									<div className="rounded-2xl border border-[var(--vliz-mist)] overflow-hidden bg-white">
										<iframe
											title="LDES Explorer"
											src={buildExplorerUrl(activeFeed.latestTtlUrl)}
											className="w-full h-[640px]"
											referrerPolicy="no-referrer"
											sandbox="allow-scripts allow-same-origin allow-forms"
										/>
									</div>
								</div>
							</div>
						) : (
							<div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-[var(--vliz-mist)] text-slate-400 p-12 text-center">
								<div className="bg-[var(--vliz-ice)] p-6 rounded-full mb-6">
									<Database size={64} className="opacity-20" />
								</div>
								<h3 className="text-xl font-bold text-slate-700 mb-2">Select a Feed to Explore</h3>
								<p className="max-w-md mx-auto">
									Choose one of the Linked Data Event Streams from the left sidebar to preview its latest members and metadata.
								</p>
							</div>
						)}
					</div>
				</div>
			</main>

			<footer className="mt-auto border-t border-[var(--vliz-mist)] py-12 bg-[var(--vliz-blue)] text-white">
				<div className="max-w-[1600px] mx-auto px-4">
					<div className="grid gap-8 lg:grid-cols-3">
						<div>
							<h3 className="text-lg font-bold">VLIZ Open Science</h3>
							<p className="mt-3 text-sm text-blue-100">
								Delivering linked data exploration with VLIZ-inspired design.
							</p>
							<p className="mt-4 text-xs text-blue-200">© 2023 VLIZ. All rights reserved</p>
						</div>
						<div>
							<h4 className="text-sm font-semibold uppercase tracking-widest text-blue-100">Policies</h4>
							<div className="mt-3 flex flex-col gap-2 text-sm">
								<a className="hover:text-white/80" href="https://www.vliz.be/en/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
								<a className="hover:text-white/80" href="https://www.vliz.be/en/terms-use" target="_blank" rel="noreferrer">Terms of Use</a>
							</div>
						</div>
						<div>
							<h4 className="text-sm font-semibold uppercase tracking-widest text-blue-100">Partners</h4>
							<div className="mt-4 flex flex-wrap gap-3">
								<a
									href="https://www.vliz.be/"
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider"
								>
									VLIZ
								</a>
								<a
									href="https://www.vlaanderen.be/"
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-center rounded-xl bg-white/10 px-3 py-2"
								>
									<img
										alt="Vlaanderen"
										src="https://assets.vlaanderen.be/image/upload/widgets/vlaanderen-verbeelding-werkt_geel.svg"
										className="h-6"
									/>
								</a>
								<a
									href="https://www.west-vlaanderen.be/"
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider"
								>
									West-Vlaanderen
								</a>
							</div>
						</div>
					</div>
				</div>
			</footer>

			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

				:root {
					--app-font: 'Space Grotesk', system-ui, -apple-system, sans-serif;
					--vliz-blue: #354d9b;
					--vliz-blue-dark: #2b3d7b;
					--vliz-ink: #1b2340;
					--vliz-ice: #f2f5fb;
					--vliz-mist: #dbe3f2;
					--vliz-sand: #f6f1e9;
					--vliz-teal: #2b7d8a;
					--vliz-orange: #e07b39;
				}

				body {
					font-family: var(--app-font);
				}

				.custom-scrollbar::-webkit-scrollbar {
					width: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: transparent;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #e2e8f0;
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #cbd5e1;
				}
			`}</style>
		</div>
	);
};

export default App;
