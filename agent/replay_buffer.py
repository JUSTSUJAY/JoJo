"""
Replay Buffer is a fundamental term/concept in Reinforcement learning.
Purpose of which is to store the experiences(observations, actions, rewards, policies..) of the agent while environment interaction.
While training, random samples from buffer are taken for efficient learning, due to which they learn from their past experiences and improve and we get a robust agent
"""

from collections import deque
import numpy as np


class ReplayBuffer:
  def __init__(self, max_size):
    self.observations = deque(maxlen=max_size)
    self.actions_dist = deque(maxlen=max_size)
    self.results = deque(maxlen=max_size)

  def __len__(self):
    return len(self.observations)

  def add_sample(self, observation, actions_dist, result):
    self.observations.append(observation)
    self.actions_dist.append(actions_dist)
    self.results.append(result)

  def sample(self, batch_size):
    indices = np.random.choice(len(self), batch_size, replace=False)
    observations = np.array([self.observations[i] for i in indices], dtype=np.float32)
    actions_dist = np.array([self.actions_dist[i] for i in indices], dtype=np.float32)
    results = np.array([self.results[i] for i in indices], dtype=np.float32)
    return observations, actions_dist, results


